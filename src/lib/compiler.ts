/* eslint-disable no-nested-ternary */
/* eslint-disable no-plusplus */
/* eslint-disable max-classes-per-file */
/* eslint-disable no-unused-vars */
import fetch from 'node-fetch';
import * as vlq from 'vlq';
import ts from 'typescript';
import * as tsdoc from '@microsoft/tsdoc';
import { Project, ts as tsMorphTs } from 'ts-morph';
import path from 'path';
import { readFileSync } from 'fs';
// eslint-disable-next-line camelcase
import { sha512_256 } from 'js-sha512';
import langspec from '../langspec.json';
import { VERSION } from '../version';
import { optimizeTeal } from './optimize';

type ExpressionChainNode = ts.ElementAccessExpression | ts.PropertyAccessExpression | ts.CallExpression;

type OnComplete = 'NoOp' | 'OptIn' | 'CloseOut' | 'ClearState' | 'UpdateApplication' | 'DeleteApplication';
const ON_COMPLETES: ['NoOp', 'OptIn', 'CloseOut', 'ClearState', 'UpdateApplication', 'DeleteApplication'] = [
  'NoOp',
  'OptIn',
  'CloseOut',
  'ClearState',
  'UpdateApplication',
  'DeleteApplication',
];

type StorageType = 'global' | 'local' | 'box';

export type CompilerOptions = {
  filename?: string;
  disableWarnings?: boolean;
  algodServer?: string;
  algodToken?: string;
  algodPort?: number;
  disableOverflowChecks?: boolean;
  disableTypeScript?: boolean;
};

export type SourceInfo = {
  filename: string;
  start: ts.LineAndCharacter;
  end: ts.LineAndCharacter;
};

// eslint-disable-next-line no-use-before-define
class TupleElement extends Array<TupleElement> {
  type!: string;

  headOffset!: number;

  arrayType: 'tuple' | 'dynamic' | 'static' | undefined;

  staticLength: number = 0;

  id!: number;

  // eslint-disable-next-line no-use-before-define
  parent?: TupleElement;

  static idCounter = 0;

  constructor(type: string, headOffset: number) {
    super();

    if (typeof type === 'number') return;

    this.id = TupleElement.idCounter;
    this.type = type;
    this.headOffset = headOffset;

    TupleElement.idCounter += 1;

    if (type.match(/\[\d+]$/)) {
      this.arrayType = 'static';
      this.staticLength = parseInt(type.match(/\[\d+]$/)![0].match(/\d+/)![0], 10);
    } else if (type.endsWith('[]')) {
      this.arrayType = 'dynamic';
    } else if (type.startsWith('[') || type.startsWith('{')) {
      this.arrayType = 'tuple';
    }
  }

  add(...elements: TupleElement[]) {
    elements.forEach((e: TupleElement) => {
      e.parent = this;
    });
    return this.push(...elements);
  }
}

function getStorageName(node: ts.PropertyAccessExpression | ts.CallExpression) {
  if (ts.isCallExpression(node.expression) && ts.isPropertyAccessExpression(node.expression.expression)) {
    return node.expression.expression.name.getText();
  }

  if (ts.isPropertyAccessExpression(node.expression)) {
    return node.expression.name.getText();
  }

  return undefined;
}

// https://github.com/microsoft/tsdoc/blob/main/api-demo/src/Formatter.ts#L7-L18
function renderDocNode(docNode: tsdoc.DocNode): string {
  let result: string = '';
  if (docNode) {
    if (docNode instanceof tsdoc.DocExcerpt) {
      result += docNode.content.toString();
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const childNode of docNode.getChildNodes()) {
      result += renderDocNode(childNode);
    }
  }
  return result.trim();
}

function stringToExpression(str: string): ts.Expression | ts.TypeNode {
  if (str.startsWith('{')) {
    const srcFile = ts.createSourceFile('', `type Foo = ${str}`, ts.ScriptTarget.ES2022, true);

    const typeAlias = srcFile.statements[0] as ts.TypeAliasDeclaration;

    return typeAlias.type;
  }

  const srcFile = ts.createSourceFile('', str, ts.ScriptTarget.ES2019, true);
  return (srcFile.statements[0] as ts.ExpressionStatement).expression;
}

function capitalizeFirstChar(str: string) {
  return `${str.charAt(0).toUpperCase() + str.slice(1)}`;
}

// Represents the stack types available in the AVM
// eslint-disable-next-line no-shadow
enum StackType {
  none = 'void',
  uint64 = 'uint64',
  bytes = 'bytes',
  any = 'any',
}

// Represents the type_enum for a transaction
// eslint-disable-next-line no-shadow
enum TransactionType {
  PaymentTx = 'pay',
  KeyRegistrationTx = 'keyreg',
  AssetConfigTx = 'acfg',
  AssetTransferTx = 'axfer',
  AssetFreezeTx = 'afrz',
  ApplicationCallTx = 'appl',
  StateProofTx = 'stpf',
}

// eslint-disable-next-line no-shadow
enum ForeignType {
  Asset = 'asset',
  Address = 'address',
  Application = 'application',
}

const TXN_TYPES = ['txn', 'pay', 'keyreg', 'acfg', 'axfer', 'afrz', 'appl'];

const TXN_METHODS = [
  'Payment',
  'AppCall',
  'MethodCall',
  'AssetTransfer',
  'AssetCreation',
  'AssetFreeze',
  'AssetConfig',
  'OnlineKeyRegistration',
  'OfflineKeyRegistration',
].flatMap((m) => [`send${m}`, `add${m}`]);

const CONTRACT_CLASS = 'Contract';
const LSIG_CLASS = 'LogicSig';

const PARAM_TYPES: { [param: string]: string } = {
  // Global
  CurrentApplicationID: ForeignType.Application,
  // Txn
  XferAsset: ForeignType.Asset,
  ApplicationID: ForeignType.Application,
  ConfigAsset: ForeignType.Asset,
  FreezeAsset: ForeignType.Asset,
  CreatedAssetID: ForeignType.Asset,
  CreatedApplicationID: ForeignType.Application,
  ApplicationArgs: `ImmediateArray: ${StackType.bytes}`,
  Applications: `ImmediateArray: ${ForeignType.Application}`,
  Assets: `ImmediateArray: ${ForeignType.Asset}`,
  Accounts: `ImmediateArray: ${ForeignType.Address}`,
};

interface StorageProp {
  type: StorageType;
  key?: string;
  keyType: string;
  valueType: string;
  /** If true, always do a box_del before a box_put incase the size of the value changed */
  dynamicSize?: boolean;
  prefix?: string;
  maxKeys?: number;
  allowPotentialCollisions?: boolean;
}

interface ABIMethod {
  name: string;
  readonly?: boolean;
  desc: string;
  args: { name: string; type: string; desc: string }[];
  returns: { type: string; desc: string };
}

interface Subroutine extends ABIMethod {
  allows: {
    create: string[];
    call: string[];
  };
  nonAbi: {
    create: string[];
    call: string[];
  };
  node: ts.MethodDeclaration | ts.ClassDeclaration;
}
// These should probably be types rather than strings?
function isNumeric(t: string): boolean {
  return ['uint64', 'asset', 'application'].includes(t.toLowerCase());
}

function isRefType(t: string): boolean {
  return ['account', 'asset', 'application'].includes(t);
}

const compilerScratch = {
  fullArray: '255 // full array',
  elementStart: '254 // element start',
  elementLength: '253 // element length',
  newElement: '252 // new element',
  elementHeadOffset: '251 // element head offset',
  lengthDifference: '250 // length difference',
  subtractHeadDifference: '249 // subtract head difference',
  verifyTxnIndex: '248 // verifyTxn index',
  spliceStart: '247 // splice start',
  spliceByteLength: '246 // splice byte length',
};

type NodeAndTEAL = {
  node: ts.Node;
  teal: string;
};

/** @internal */
export default class Compiler {
  static diagsRan: string[] = [''];

  private scratch: { [name: string]: { slot: number; type: string } } = {};

  private currentProgram: 'approval' | 'clear' | 'lsig' = 'approval';

  teal: {
    approval: NodeAndTEAL[];
    clear: NodeAndTEAL[];
    lsig: NodeAndTEAL[];
  } = {
    approval: [],
    clear: [],
    lsig: [],
  };

  generatedTeal: string = '';

  generatedClearTeal: string = '';

  private frameInfo: {
    [name: string]: {
      start: number;
      end: number;
      frame: {
        [index: number]: {
          name: string;
          type: string;
        };
      };
    };
  } = {};

  private lastNode!: ts.Node;

  private mapKeyTypes: {
    global: string[];
    local: string[];
    box: string[];
  } = { global: [], local: [], box: [] };

  private classNode!: ts.ClassDeclaration;

  srcMap: {
    source: number;
    teal: number;
    pc?: number[];
  }[] = [];

  private customTypes: { [name: string]: string } = {};

  private frameIndex: number = 0;

  private frameSize: { [methodName: string]: number } = {};

  private subroutines: Subroutine[] = [];

  private clearStateCompiled: boolean = false;

  private ifCount: number = -1;

  private ternaryCount: number = 0;

  private whileCount: number = 0;

  private doWhileCount: number = 0;

  private forCount: number = 0;

  filename: string;

  content: string;

  private processErrorNodes: ts.Node[] = [];

  private localVariables: {
    [name: string]: {
      /** The index of the value in the current frame */
      index?: number;

      /**
       * The name of the frame that this object is pointing to. For example:
       * ```ts
       * const x = y
       * ```
       *
       * results in
       *
       * ```ts
       * this.localVariables.x.framePointer === 'y'
       * ```
       */
      framePointer?: string;

      /** The type of the value in the variable */
      type: string;

      /**
       * The accessors used to access the underlying array. For example,
       * ```ts
       * const x = a[1][2]
       * ```
       *
       * Results in
       *
       * ```ts
       * this.localVariables.x.accessors === [1,2]
       * ```
       */
      accessors?: (ts.Expression | string)[];

      /** The storage property expression if this object is accessing storage */
      storageExpression?: ts.PropertyAccessExpression;

      /**
       * If this variable is accessing a storage map, then this is the name of the saved key in `this.localVariables`.
       * For example:
       * ```ts
       * const x = this.myMap('foo').value
       *```
       *
       * Results in
       *
       * ```ts
       * this.localVariables.x.storageKeyFrame === 'storage key//x'
       * ```
       */
      storageKeyFrame?: string;

      /**
       * If this variable is accessing local storage, then this is the name of the saved account in `this.localVariables`. For example:
       * ```ts
       * const x = this.localValue(this.txn.sender).value
       * ```
       *
       * Results in
       *
       * ```ts
       * this.localVariables.x.storageKeyFrame === 'storage account//x'
       * ```
       */
      storageAccountFrame?: string;
    };
  } = {};

  private currentSubroutine!: Subroutine;

  private bareCallConfig: {
    NoOp?: { action: 'CALL' | 'CREATE' | 'NEVER'; method: string };
    OptIn?: { action: 'CALL' | 'CREATE'; method: string };
    CloseOut?: { action: 'CALL' | 'CREATE'; method: string };
    ClearState?: { action: 'CALL' | 'CREATE'; method: string };
    UpdateApplication?: { action: 'CALL' | 'CREATE'; method: string };
    DeleteApplication?: { action: 'CALL' | 'CREATE'; method: string };
  } = {};

  abi: {
    name: string;
    desc: string;
    methods: ABIMethod[];
  } = {
    name: '',
    desc: '',
    methods: [],
  };

  private storageProps: { [key: string]: StorageProp } = {};

  private lastType: string = 'void';

  private contractClasses: string[] = [];

  private lsigClasses: string[] = [];

  name: string;

  pcToLine: { [key: number]: number } = {};

  lineToPc: { [key: number]: number[] } = {};

  private lastSourceCommentRange: [number, number] = [-1, -1];

  private comments: number[] = [];

  private typeHint?: string;

  private constants: { [name: string]: ts.Node };

  private readonly OP_PARAMS: {
    [type: string]: { name: string; type?: string; args: number; fn: (node: ts.Node) => void }[];
  } = {
    account: [
      ...this.getOpParamObjects('acct_params_get'),
      ...this.getOpParamObjects('asset_holding_get'),
      {
        name: 'State',
        type: 'any',
        args: 3,
        fn: (node: ts.Node) => {
          this.maybeValue(node, 'app_local_get_ex', StackType.any);
        },
      },
    ],
    application: [
      ...this.getOpParamObjects('app_params_get'),
      {
        name: 'Global',
        type: 'any',
        args: 2,
        fn: (node: ts.Node) => {
          this.maybeValue(node, 'app_global_get_ex', StackType.any);
        },
      },
    ],
    txn: this.getOpParamObjects('txn'),
    global: this.getOpParamObjects('global'),
    itxn: this.getOpParamObjects('itxn'),
    gtxns: this.getOpParamObjects('gtxns'),
    asset: this.getOpParamObjects('asset_params_get'),
  };

  programVersion = 9;

  importRegistry: Record<string, string> = {};

  templateVars: Record<string, { name: string; type: string }> = {};

  /** Verifies ABI types are properly decoded for runtime usage */
  private checkDecoding(node: ts.Node, type: string) {
    if (type === 'bool') {
      this.pushLines(node, 'int 0', 'getbit');
    } else if (this.isDynamicArrayOfStaticType(type)) {
      this.pushVoid(node, 'extract 2 0');
    } else if (isNumeric(type)) {
      this.pushVoid(node, 'btoi');
    }
  }

  /** Handle any action related to boxes or local/global state */
  private handleStorageAction({
    node,
    name,
    action,
    storageKeyFrame,
    storageAccountFrame,
    newValue,
  }: {
    /**
     * The node for the storage action. Should be the final callexpression or property access
     * For example: `this.myBox.delete()` or `this.myBox.value`
     */
    node: ts.PropertyAccessExpression | ts.CallExpression;
    /** The name of the storage property as defined in the contract */
    name: string;
    /** The action to take on the storage property */
    action: 'get' | 'set' | 'exists' | 'delete' | 'create' | 'extract' | 'replace' | 'size';
    /** If the key for the target storage object is saved in the frame, then this is the name of the key in this.localVariables */
    storageKeyFrame?: string;
    /** If the account for the target local storage is saved in the frame, then this is the name of the key in this.localVariables */
    storageAccountFrame?: string;
    /** Only provided when setting a value */
    newValue?: ts.Node;
  }) {
    const args: ts.Expression[] = [];
    let keyNode: ts.Expression;

    // If the node is a call expression, such as `this.myBox.replace(x, y)` get the arguments
    // then use the property access expression as the node throughout the rest of the method
    if (ts.isCallExpression(node)) {
      node.arguments.forEach((a) => args.push(a));
      if (!ts.isPropertyAccessExpression(node.expression)) throw Error();

      // eslint-disable-next-line no-param-reassign
      node = node.expression;
    }

    // The node representing the key for the storage object
    if (ts.isCallExpression(node.expression)) {
      keyNode = node.expression.arguments[node.expression.arguments.length === 2 ? 1 : 0];
    }

    const { type, valueType, keyType, key, dynamicSize, prefix } = this.storageProps[name];

    const storageType = type;

    // If accesing an account's local state that is saved in the frame
    if (storageAccountFrame && storageType === 'local') {
      this.pushVoid(
        node.expression,
        `frame_dig ${this.localVariables[storageAccountFrame].index} // ${storageAccountFrame}`
      );

      // Accessing a local state for an account given as an argument
    } else if (storageType === 'local') {
      if (!ts.isCallExpression(node.expression)) throw Error();
      this.processNode(node.expression.arguments[0]);
    }

    // Since global/local state doesn't have a native "exists" opcode like boxes
    // we need to use get...ex opcode on the current app ID
    if (action === 'exists' && (storageType === 'global' || storageType === 'local')) {
      this.pushVoid(node.expression, 'txna Applications 0');
    }

    // If a key is defined in the property (LocalStateKey, GlobalStateKey, BoxKey)
    if (key) {
      const hex = Buffer.from(key).toString('hex');
      this.pushVoid(node.expression, `byte 0x${hex} // "${key}"`);

      // If the key is saved in frame
    } else if (storageKeyFrame) {
      this.pushVoid(node.expression, `frame_dig ${this.localVariables[storageKeyFrame].index} // ${storageKeyFrame}`);

      // If the key is provided as an argument
    } else {
      if (prefix) {
        const hex = Buffer.from(prefix).toString('hex');
        this.pushVoid(keyNode!, `byte 0x${hex} // "${prefix}"`);
      }
      this.typeHint = keyType;
      this.processNode(keyNode!);
      this.typeHint = undefined;

      if (keyType !== StackType.bytes) {
        this.checkEncoding(keyNode!, this.lastType);
      }

      if (prefix) this.pushVoid(keyNode!, 'concat');
    }

    switch (action) {
      case 'get':
        if (storageType === 'global') {
          this.push(node.expression, 'app_global_get', valueType);
        } else if (storageType === 'local') {
          this.push(node.expression, 'app_local_get', valueType);
        } else if (storageType === 'box') {
          this.maybeValue(node.expression, 'box_get', valueType);
        }

        if ((storageType === 'box' || !isNumeric(valueType)) && valueType !== StackType.bytes) {
          this.checkDecoding(node, valueType);
        }

        break;

      case 'set': {
        if (storageType === 'box' && dynamicSize) {
          this.pushLines(node.expression, 'dup', 'box_del', 'pop');
        }

        if (newValue) {
          this.typeHint = valueType;
          this.processNode(newValue);
          this.typeHint = undefined;

          // if valueType is not bytes
          // or if storage type is box
          if ((storageType === 'box' || !isNumeric(valueType)) && valueType !== StackType.bytes) {
            this.checkEncoding(newValue, this.lastType);
          }

          this.typeComparison(this.lastType, valueType);
        } else {
          const command = storageType === 'box' ? 'swap' : storageType === 'local' ? 'uncover 2' : 'swap';
          this.pushVoid(node.expression, command);

          if ((storageType === 'box' || !isNumeric(valueType)) && valueType !== StackType.bytes) {
            this.checkEncoding(node, valueType);
          }
        }

        const operation =
          storageType === 'global' ? 'app_global_put' : storageType === 'local' ? 'app_local_put' : 'box_put';
        this.push(node.expression, operation, valueType);
        break;
      }

      case 'exists': {
        const existsAction =
          storageType === 'global' ? 'app_global_get_ex' : storageType === 'local' ? 'app_local_get_ex' : 'box_len';
        this.hasMaybeValue(node.expression, existsAction);
        break;
      }

      case 'delete': {
        const deleteAction =
          storageType === 'global' ? 'app_global_del' : storageType === 'local' ? 'app_local_del' : 'box_del';
        this.pushVoid(node.expression, deleteAction);
        break;
      }

      case 'create':
        this.processNode(args[0]);
        this.pushVoid(node.expression, 'box_create');
        break;

      case 'extract':
        this.processNode(args[0]);
        this.processNode(args[1]);
        this.push(node.expression, 'box_extract', StackType.bytes);
        break;

      case 'replace':
        if (args[0] && args[1]) {
          this.processNode(args[0]);
          this.processNode(args[1]);
        } else {
          this.pushVoid(node.expression, 'cover 2');
        }
        this.pushVoid(node.expression, 'box_replace');
        break;

      case 'size':
        this.maybeValue(node.expression, 'box_len', StackType.uint64);
        break;
      default:
        throw new Error();
    }
  }

  private andCount: number = 0;

  private orCount: number = 0;

  private sourceFile: ts.SourceFile;

  private nodeDepth: number = 0;

  /**
     The current top level node being processed within a class

    This is used to determine if a function call should return a value or not. For example,

    ```ts
    class Foo {
      bar(arr: number[]) {
        const x = arr.pop(); // "arr.pop()" is NOT top-level node
        arr.pop(); // "arr.pop()" is top-level node
      }
    }
    ```
   */
  private topLevelNode!: ts.Node;

  private multiplyWideRatioFactors(node: ts.Node, factors: ts.Expression[]) {
    if (factors.length === 1) {
      this.pushVoid(node, 'int 0');
      this.processNode(factors[0]);
    } else {
      this.processNode(factors[0]);
      this.processNode(factors[1]);
      this.pushVoid(node, 'mulw');
    }

    factors.slice(2).forEach((f) => {
      this.processNode(f);

      /*
      https://github.com/algorand/pyteal/blob/d117f99c07a64cddf6de21b72232df12b53fdbbb/pyteal/ast/widemath.py#LL12C8-L12C8

      stack is [..., A, B, C], where C is current factor
      need to pop all A,B,C from stack and push X,Y, where X and Y are:
            X * 2**64 + Y = (A * 2**64 + B) * C
      <=>   X * 2**64 + Y = A * C * 2**64 + B * C
      <=>   X = A * C + highword(B * C)
            Y = lowword(B * C)

      TealOp(expr, Op.uncover, 2),  # stack: [..., B, C, A]
      TealOp(expr, Op.dig, 1),  # stack: [..., B, C, A, C]
      TealOp(expr, Op.mul),  # stack: [..., B, C, A*C]
      TealOp(expr, Op.cover, 2),  # stack: [..., A*C, B, C]
      TealOp(
          expr, Op.mulw
      ),  # stack: [..., A*C, highword(B*C), lowword(B*C)]
      TealOp(
          expr, Op.cover, 2
      ),  # stack: [..., lowword(B*C), A*C, highword(B*C)]
      TealOp(
          expr, Op.add
      ),  # stack: [..., lowword(B*C), A*C+highword(B*C)]
      TealOp(
          expr, Op.swap
      ),  # stack: [..., A*C+highword(B*C), lowword(B*C)]
      */

      this.pushLines(node, 'uncover 2', 'dig 1', '*', 'cover 2', 'mulw', 'cover 2', '+', 'swap');
    });
  }

  private customProperties: {
    [propertyName: string]: {
      fn: (node: ts.PropertyAccessExpression) => void;
      check: (node: ts.PropertyAccessExpression) => boolean;
    };
  } = {
    id: {
      check: (node: ts.PropertyAccessExpression) => ['asset', 'application'].includes(this.lastType),
      fn: (node: ts.PropertyAccessExpression) => {
        this.lastType = StackType.uint64;
      },
    },
    zeroIndex: {
      check: (node: ts.PropertyAccessExpression) => ['Asset', 'Application'].includes(node.expression.getText()),
      fn: (node: ts.PropertyAccessExpression) => {
        this.push(node.name, 'int 0', this.getABIType(node.expression.getText()));
      },
    },
    zeroAddress: {
      check: (node: ts.PropertyAccessExpression) => ['Address', 'Account'].includes(node.expression.getText()),
      fn: (node: ts.PropertyAccessExpression) => {
        this.push(node.name, 'global ZeroAddress', 'Address');
      },
    },
    length: {
      check: (node: ts.PropertyAccessExpression) => {
        const abiType = this.lastType;
        return !!abiType.match(/\[\d*\]$/) || ['string', 'bytes', 'txnGroup'].includes(abiType);
      },
      fn: (n: ts.PropertyAccessExpression) => {
        if (this.lastType === StackType.bytes || this.lastType === 'string') {
          this.push(n.name, 'len', StackType.uint64);
          return;
        }

        if (this.isDynamicArrayOfStaticType(this.lastType)) {
          this.pushLines(n.name, 'len', `int ${this.getTypeLength(this.lastType.replace(/\[\]$/, ''))}`, '/');
          this.lastType = StackType.uint64;
          return;
        }

        if (!this.lastType.endsWith('[]')) throw new Error('.length is currently only supported on dynamic arrays');
        this.pushLines(n.name, 'extract 0 2', 'btoi');
        this.lastType = StackType.uint64;
      },
    },
  };

  private verifyTxn(node: ts.CallExpression, type?: string) {
    if (!ts.isObjectLiteralExpression(node.arguments[1])) throw new Error('Expected object literal as second argument');

    const preTealLength = this.teal[this.currentProgram].length;

    this.processNode(node.arguments[0]);

    const indexInScratch: boolean = this.teal[this.currentProgram].length - preTealLength > 1;

    if (indexInScratch) {
      this.pushVoid(node, `store ${compilerScratch.verifyTxnIndex}`);
    } else this.teal[this.currentProgram].pop();

    const loadField = (fieldNode: ts.Node, field: string) => {
      if (indexInScratch) {
        this.pushVoid(fieldNode, `load ${compilerScratch.verifyTxnIndex}`);
      } else if (node.arguments[0].getText() !== 'this.txn') {
        this.processNode(node.arguments[0]);
      }

      const txnOp = node.arguments[0].getText() === 'this.txn' ? 'txn' : 'gtxns';
      this.pushVoid(fieldNode, `${txnOp} ${capitalizeFirstChar(field)}`);
    };

    // Don't perform type check on method arguments because they are checked in the method routing
    let skipTypeCheck = false;
    if (ts.isIdentifier(node.arguments[0])) {
      const { name } = this.processFrame(node.arguments[0], node.arguments[0].getText(), false);
      if (this.currentSubroutine.args.find((a) => a.name === node.arguments[0].getText())) {
        skipTypeCheck = this.localVariables[name].type === type;
      }
    }

    if (
      type !== undefined &&
      !skipTypeCheck &&
      (this.currentProgram === 'lsig' || node.arguments[0].getText() !== 'this.txn')
    ) {
      this.pushVoid(node, `// verify ${type}`);
      loadField(node, 'typeEnum');
      this.pushVoid(node, `int ${type}`);
      this.pushVoid(node, '==');
      this.pushVoid(node, 'assert');
    }

    node.arguments[1].properties.forEach((p, i) => {
      if (!ts.isPropertyAssignment(p)) throw new Error();
      const field = p.name.getText();

      this.pushVoid(p, `// verify ${field}`);

      if (ts.isObjectLiteralExpression(p.initializer)) {
        p.initializer.properties.forEach((c) => {
          if (!ts.isPropertyAssignment(c)) throw new Error();

          const condition = c.name.getText();

          if (['includedIn', 'notIncludedIn'].includes(condition)) {
            if (!ts.isArrayLiteralExpression(c.initializer)) throw Error('Expected array literal');
            c.initializer.elements.forEach((e, eIndex) => {
              loadField(p, field);
              this.processNode(e);
              const op = condition === 'includedIn' ? '==' : '!=';
              this.pushLines(c, op);
              if (eIndex) this.pushLines(c, '||');
            });

            this.pushVoid(c, 'assert');
            return;
          }

          const conditionMapping: Record<string, string> = {
            greaterThan: '>',
            greaterThanEqualTo: '>=',
            lessThan: '<',
            lessThanEqualTo: '<=',
            not: '!=',
          };

          const op = conditionMapping[condition];

          if (op === undefined) throw Error();
          loadField(p, field);
          this.processNode(c.initializer);
          this.pushLines(c, op, 'assert');
        });
        return;
      }

      loadField(p, field);
      this.processNode(p.initializer);
      this.pushLines(p, '==', 'assert');
    });
  }

  private customMethods: {
    [methodName: string]: {
      fn: (node: ts.CallExpression) => void;
      check: (node: ts.CallExpression) => boolean;
    };
  } = {
    ecdsa_verify: {
      check: (node: ts.CallExpression) => ts.isIdentifier(node.expression),
      fn: (node: ts.CallExpression) => {
        // data
        this.processNode(node.arguments[1]);
        this.typeComparison(this.lastType, 'byte[32]');

        // signature component
        if (ts.isNumericLiteral(node.arguments[2])) {
          this.processNumericLiteralWithType(node.arguments[2], 'bigint');
        } else {
          this.processNode(node.arguments[2]);
          this.typeComparison(this.lastType, 'bigint');
        }

        // signature component
        if (ts.isNumericLiteral(node.arguments[3])) {
          this.processNumericLiteralWithType(node.arguments[3], 'bigint');
        } else {
          this.processNode(node.arguments[3]);
          this.typeComparison(this.lastType, 'bigint');
        }

        // public key component
        if (ts.isNumericLiteral(node.arguments[4])) {
          this.processNumericLiteralWithType(node.arguments[4], 'bigint');
        } else {
          this.processNode(node.arguments[4]);
          this.typeComparison(this.lastType, 'bigint');
        }

        // public key component
        if (ts.isNumericLiteral(node.arguments[5])) {
          this.processNumericLiteralWithType(node.arguments[5], 'bigint');
        } else {
          this.processNode(node.arguments[5]);
          this.typeComparison(this.lastType, 'bigint');
        }

        if (!ts.isStringLiteral(node.arguments[0])) throw Error();

        this.push(node, `ecdsa_verify ${node.arguments[0].text}`, 'bool');
      },
    },
    ecdsa_pk_decompress: {
      check: (node: ts.CallExpression) => ts.isIdentifier(node.expression),
      fn: (node: ts.CallExpression) => {
        // pubkey
        this.processNode(node.arguments[1]);
        this.typeComparison(this.lastType, 'byte[33]');

        if (!ts.isStringLiteral(node.arguments[0])) throw Error();
        this.pushVoid(node, `ecdsa_pk_decompress ${node.arguments[0].text}`);

        this.pushLines(
          node,
          `byte 0x${'FF'.repeat(32)}`,
          'b&',
          'swap',
          `byte 0x${'FF'.repeat(32)}`,
          'b&',
          'swap',
          'concat'
        );

        this.lastType = '[uint256,uint256]';
      },
    },
    ecdsa_pk_recover: {
      check: (node: ts.CallExpression) => ts.isIdentifier(node.expression),
      fn: (node: ts.CallExpression) => {
        // data
        this.processNode(node.arguments[1]);
        this.typeComparison(this.lastType, 'byte[32]');

        // recovery ID
        if (ts.isNumericLiteral(node.arguments[2])) {
          this.processNumericLiteralWithType(node.arguments[2], 'uint64');
        } else {
          this.processNode(node.arguments[2]);
          this.typeComparison(this.lastType, 'uint64');
        }

        // sig component
        if (ts.isNumericLiteral(node.arguments[3])) {
          this.processNumericLiteralWithType(node.arguments[3], 'uint256');
        } else {
          this.processNode(node.arguments[3]);
          this.typeComparison(this.lastType, 'bigint');
        }

        // sig component
        if (ts.isNumericLiteral(node.arguments[4])) {
          this.processNumericLiteralWithType(node.arguments[4], 'uint256');
        } else {
          this.processNode(node.arguments[4]);
          this.typeComparison(this.lastType, 'uint256');
        }

        if (!ts.isStringLiteral(node.arguments[0])) throw Error();
        this.pushVoid(node, `ecdsa_pk_recover ${node.arguments[0].text}`);

        this.pushLines(
          node,
          `byte 0x${'FF'.repeat(32)}`,
          'b&',
          'swap',
          `byte 0x${'FF'.repeat(32)}`,
          'b&',
          'swap',
          'concat'
        );

        this.lastType = '[uint256,uint256]';
      },
    },
    // Global methods
    clone: {
      check: (node: ts.CallExpression) => ts.isIdentifier(node.expression),
      fn: (node: ts.CallExpression) => {
        this.processNode(node.arguments[0]);
      },
    },
    bzero: {
      check: (node: ts.CallExpression) => ts.isIdentifier(node.expression),
      fn: (node: ts.CallExpression) => {
        const typeArg = node.typeArguments?.[0];
        const arg = node.arguments[0];

        if (typeArg && !arg) {
          if (this.isDynamicType(typeArg.getText())) throw Error('bzero cannot be used with dynamic types');

          this.push(node, `byte 0x${'00'.repeat(this.getTypeLength(typeArg.getText()))}`, typeArg.getText());
          return;
        }

        if (arg && !typeArg) {
          if (ts.isNumericLiteral(arg)) this.push(node, `byte 0x${'00'.repeat(parseInt(arg.getText(), 10))}`, 'bytes');
          else {
            this.processNode(arg);
            this.push(node, 'bzero', 'bytes');
          }
          return;
        }

        throw Error('bzero cannot be called with both a type argument and an argument');
      },
    },
    rawBytes: {
      check: (node: ts.CallExpression) => ts.isIdentifier(node.expression),
      fn: (node: ts.CallExpression) => {
        if (node.arguments.length !== 1) throw new Error();
        this.processNode(node.arguments[0]);
        this.checkEncoding(node.arguments[0], this.lastType);
        this.lastType = 'bytes';
      },
    },
    castBytes: {
      check: (node: ts.CallExpression) => ts.isIdentifier(node.expression),
      fn: (node: ts.CallExpression) => {
        if (node.typeArguments?.length !== 1) throw Error('castBytes must be given a single type argument');
        this.processNode(node.arguments[0]);
        this.lastType = node.typeArguments[0].getText();
        if (!this.disableWarnings)
          // eslint-disable-next-line no-console
          console.warn('WARNING: castBytes is UNSAFE and does not validate encoding. Use at your own risk.');
      },
    },
    wideRatio: {
      check: (node: ts.CallExpression) => ts.isIdentifier(node.expression),
      fn: (node: ts.CallExpression) => {
        if (
          node.arguments.length !== 2 ||
          !ts.isArrayLiteralExpression(node.arguments[0]) ||
          !ts.isArrayLiteralExpression(node.arguments[1])
        )
          throw new Error();

        this.multiplyWideRatioFactors(node, new Array(...node.arguments[0].elements));
        this.multiplyWideRatioFactors(node, new Array(...node.arguments[1].elements));

        this.pushLines(node, 'divmodw', 'pop', 'pop', 'swap', '!', 'assert');

        this.lastType = 'uint64';
      },
    },
    hex: {
      check: (node: ts.CallExpression) => ts.isIdentifier(node.expression),
      fn: (node: ts.CallExpression) => {
        if (node.arguments.length !== 1) throw new Error();
        if (!ts.isStringLiteral(node.arguments[0])) throw new Error();

        this.push(node.arguments[0], `byte 0x${node.arguments[0].text.replace(/^0x/, '')}`, StackType.bytes);
      },
    },
    btobigint: {
      check: (node: ts.CallExpression) => ts.isIdentifier(node.expression),
      fn: (node: ts.CallExpression) => {
        this.processNode(node.arguments[0]);
        this.lastType = 'bigint';
      },
    },
    verifyTxn: {
      check: (node: ts.CallExpression) => ts.isIdentifier(node.expression),
      fn: (node: ts.CallExpression) => this.verifyTxn(node),
    },
    verifyPayTxn: {
      check: (node: ts.CallExpression) => ts.isIdentifier(node.expression),
      fn: (node: ts.CallExpression) => this.verifyTxn(node, TransactionType.PaymentTx),
    },
    verifyAppCallTxn: {
      check: (node: ts.CallExpression) => ts.isIdentifier(node.expression),
      fn: (node: ts.CallExpression) => this.verifyTxn(node, TransactionType.ApplicationCallTx),
    },
    verifyAssetTransferTxn: {
      check: (node: ts.CallExpression) => ts.isIdentifier(node.expression),
      fn: (node: ts.CallExpression) => this.verifyTxn(node, TransactionType.AssetTransferTx),
    },
    verifyAssetConfigTxn: {
      check: (node: ts.CallExpression) => ts.isIdentifier(node.expression),
      fn: (node: ts.CallExpression) => this.verifyTxn(node, TransactionType.AssetConfigTx),
    },
    verifyKeyRegTxn: {
      check: (node: ts.CallExpression) => ts.isIdentifier(node.expression),
      fn: (node: ts.CallExpression) => this.verifyTxn(node, TransactionType.KeyRegistrationTx),
    },
    addr: {
      check: (node: ts.CallExpression) => ts.isIdentifier(node.expression),
      fn: (node: ts.CallExpression) => {
        // TODO: add pseudo op type parsing/assertion to handle this
        // not currently exported in langspeg.json
        if (!ts.isStringLiteral(node.arguments[0])) throw new Error('addr() argument must be a string literal');
        this.push(node.arguments[0], `addr ${node.arguments[0].text}`, ForeignType.Address);
      },
    },
    method: {
      check: (node: ts.CallExpression) => ts.isIdentifier(node.expression),
      fn: (node: ts.CallExpression) => {
        if (!ts.isStringLiteral(node.arguments[0])) throw new Error('method() argument must be a string literal');
        this.push(node.arguments[0], `method "${node.arguments[0].text}"`, StackType.bytes);
      },
    },
    // Array methods
    push: {
      check: (node: ts.CallExpression) =>
        ts.isPropertyAccessExpression(node.expression) &&
        this.getStackTypeFromNode(node.expression.expression).endsWith(']'),
      fn: (node: ts.CallExpression) => {
        if (!ts.isPropertyAccessExpression(node.expression)) throw Error();

        if (!this.lastType.endsWith('[]')) throw new Error('Can only push to dynamic array');
        if (!this.isDynamicArrayOfStaticType(this.lastType))
          throw new Error('Cannot push to dynamic array of dynamic types');
        this.processNode(node.arguments[0]);
        this.checkEncoding(node.arguments[0], this.lastType.replace(/\[\]$/, ''));
        this.pushVoid(node, 'concat');

        this.updateValue(node.expression.expression);
      },
    },
    pop: {
      check: (node: ts.CallExpression) =>
        ts.isPropertyAccessExpression(node.expression) &&
        this.getStackTypeFromNode(node.expression.expression).endsWith(']'),
      fn: (node: ts.CallExpression) => {
        if (!ts.isPropertyAccessExpression(node.expression)) throw Error();

        const poppedType = this.lastType.replace(/\[\]$/, '');
        if (!this.lastType.endsWith('[]')) throw new Error('Can only pop from dynamic array');
        if (this.isDynamicType(poppedType)) throw new Error('Cannot pop from dynamic array of dynamic types');

        const typeLength = this.getTypeLength(this.lastType.replace(/\[\]$/, ''));
        this.pushLines(node.expression, 'dup', 'len', `int ${typeLength}`, '-', 'int 0', 'swap', 'extract3');

        // only get the popped element if we're expecting a return value
        if (this.topLevelNode !== node) {
          this.pushLines(node.expression, 'dup', 'len', `int ${typeLength}`);

          this.processNode(node.expression.expression);

          this.pushLines(node.expression, 'cover 2', 'extract3', 'swap');
        }

        this.updateValue(node.expression.expression);

        if (this.topLevelNode !== node) this.checkDecoding(node, poppedType);

        this.lastType = poppedType;
      },
    },
    splice: {
      check: (node: ts.CallExpression) =>
        ts.isPropertyAccessExpression(node.expression) &&
        this.getStackTypeFromNode(node.expression.expression).endsWith(']'),
      fn: (node: ts.CallExpression) => {
        if (!ts.isPropertyAccessExpression(node.expression)) throw Error();

        if (!this.lastType.endsWith('[]')) throw new Error(`Can only splice dynamic array (got ${this.lastType})`);
        if (!this.isDynamicArrayOfStaticType(this.lastType))
          throw new Error('Cannot splice a dynamic array of dynamic types');

        const elementType = this.lastType.replace(/\[\]$/, '');

        // `int ${parseInt(node.arguments[1].getText(), 10)}`
        this.processNode(node.arguments[1]);

        // TODO: Optimize for literals
        // const spliceIndex = parseInt(node.arguments[0].getText(), 10);
        // const spliceStart = spliceIndex * this.getTypeLength(elementType);
        this.processNode(node.arguments[0]);
        this.pushLines(node, `int ${this.getTypeLength(elementType)}`, '*', `store ${compilerScratch.spliceStart}`);

        // const spliceElementLength = parseInt(node.arguments[1].getText(), 10);
        // const spliceByteLength = (spliceElementLength + 1) * this.getTypeLength(elementType);
        this.processNode(node.arguments[1]);
        this.pushLines(
          node,
          `int ${this.getTypeLength(elementType)}`,
          '*',
          `int ${this.getTypeLength(elementType)}`,
          '+',
          `store ${compilerScratch.spliceByteLength}`
        );

        // extract first part
        this.processNode(node.expression.expression);
        this.pushLines(node, 'int 0', `load ${compilerScratch.spliceStart}`, 'substring3');

        // extract second part
        this.processNode(node.expression.expression);
        this.pushLines(
          node,
          // get end
          'dup',
          'len',
          // get start (end of splice)
          `load ${compilerScratch.spliceStart}`,
          `load ${compilerScratch.spliceByteLength}`,
          '+',
          `int ${this.getTypeLength(elementType)}`,
          '-',
          'swap',
          // extract second part
          'substring3',
          // concat everything
          'concat'
        );

        if (this.topLevelNode !== node) {
          // this.pushLines(`byte 0x${spliceElementLength.toString(16).padStart(4, '0')}`);

          this.processNode(node.expression.expression);
          this.pushLines(
            node,
            `load ${compilerScratch.spliceStart}`,
            // `int ${spliceByteLength - this.getTypeLength(elementType)}`,
            `load ${compilerScratch.spliceByteLength}`,
            `int ${this.getTypeLength(elementType)}`,
            '-',
            'extract3',
            'swap'
          );
        }

        this.updateValue(node.expression.expression);
        this.lastType = `${elementType}[]`;
      },
    },
    forEach: {
      check: (node: ts.CallExpression) =>
        ts.isPropertyAccessExpression(node.expression) &&
        this.getStackTypeFromNode(node.expression.expression).endsWith(']'),
      fn: (node: ts.CallExpression) => {
        throw Error('forEach not yet supported. Use for loop instead');
      },
    },
    // Address methods
    fromBytes: {
      check: (node: ts.CallExpression) =>
        ts.isPropertyAccessExpression(node.expression) && node.expression.expression.getText() === 'Address',
      fn: (node: ts.CallExpression) => {
        if (!ts.isPropertyAccessExpression(node.expression)) throw Error();

        this.processNode(node.arguments[0]);
        this.lastType = this.getABIType(node.expression.expression.getText());
      },
    },
    // Asset / Application fromID
    fromID: {
      check: (node: ts.CallExpression) =>
        ts.isPropertyAccessExpression(node.expression) &&
        (node.expression.expression.getText() === 'Asset' || node.expression.expression.getText() === 'Application'),
      fn: (node: ts.CallExpression) => {
        if (!ts.isPropertyAccessExpression(node.expression)) throw Error();

        this.processNode(node.arguments[0]);
        this.lastType = this.getABIType(node.expression.expression.getText());
      },
    },
    // number methods
    toString: {
      check: (node: ts.CallExpression) => !!this.getABIType(this.lastType).match(/uint\d+$/),
      fn: (node: ts.CallExpression) => {
        if (this.lastType !== StackType.uint64) {
          const width = parseInt(this.getABIType(this.lastType).match(/\d+/)![0], 10);
          if (width > 64) throw Error('toString is only supported for uint64 and smaller');
          this.pushVoid(node, 'btoi');
        }

        this.pushVoid(node, 'callsub itoa');
        this.lastType = 'bytes';
      },
    },
    // string methods
    substring: {
      check: (node: ts.CallExpression) => ['byte[]', 'string', 'bytes'].includes(this.lastType),
      fn: (node: ts.CallExpression) => {
        this.processNode(node.arguments[0]);
        this.processNode(node.arguments[1]);
        this.push(node, 'substring3', 'bytes');
      },
    },
  };

  private disableWarnings: boolean;

  private algodServer: string;

  private algodPort: number;

  private algodToken: string;

  private disableOverflowChecks: boolean;

  private disableTypeScript: boolean;

  private tealscriptImport!: string;

  private events: Record<string, string[]> = {};

  constructor(content: string, className: string, options?: CompilerOptions) {
    this.disableWarnings = options?.disableWarnings || false;
    this.algodServer = options?.algodServer || 'http://localhost';
    this.algodPort = options?.algodPort || 4001;
    this.algodToken = options?.algodToken || 'a'.repeat(64);
    this.filename = options?.filename || '';
    this.disableOverflowChecks = options?.disableOverflowChecks || false;
    this.disableTypeScript = options?.disableTypeScript || false;

    this.content = content;
    this.name = className;
    this.sourceFile = ts.createSourceFile(this.filename, this.content, ts.ScriptTarget.ES2022, true);
    this.constants = {};
  }

  static compileAll(content: string, options: CompilerOptions): Promise<Compiler>[] {
    const src = ts.createSourceFile(options.filename || '', content, ts.ScriptTarget.ES2022, true);
    const compilers = src.statements
      .filter(
        (body) =>
          ts.isClassDeclaration(body) &&
          [CONTRACT_CLASS, LSIG_CLASS].includes(body.heritageClauses?.[0]?.types[0].expression.getText() || '')
      )
      .map(async (body) => {
        if (!ts.isClassDeclaration(body)) throw Error();
        const name = body.name!.text;

        const compiler = new Compiler(content, name, options);
        await compiler.compile();
        await compiler.algodCompile();

        return compiler;
      });

    return compilers;
  }

  getOpParamObjects(op: string) {
    const opSpec = langspec.Ops.find((o) => o.Name === op);
    if (opSpec === undefined) {
      throw new Error(`Unknown op ${op}`);
    }

    return opSpec.ArgEnum!.map((arg, i) => {
      let fn;
      const type = PARAM_TYPES[arg] || opSpec.ArgEnumTypes![i].replace(/[\d*]byte/, 'btyes');

      if (['txn', 'global', 'itxn', 'gtxns'].includes(op)) {
        fn = (node: ts.Node) => this.push(node, `${op} ${arg}`, type);
      } else {
        fn = (node: ts.Node) => this.maybeValue(node, `${op} ${arg}`, type);
      }
      return {
        name: arg,
        args: opSpec.Args?.length || 0,
        fn,
      };
    });
  }

  private isDynamicType(type: string): boolean {
    if (this.customTypes[type]) return this.isDynamicType(this.customTypes[type]);

    return type.includes('[]') || type.includes('string') || type.includes('bytes');
  }

  private getTypeLength(inputType: string): number {
    if (inputType === '[]') return 0;

    const type = this.getABIType(inputType);

    const typeNode = stringToExpression(type);
    if (type.toLowerCase().startsWith('staticarray')) {
      if (ts.isExpressionWithTypeArguments(typeNode)) {
        const innerType = typeNode!.typeArguments![0];
        const length = this.getStaticArrayLength(typeNode);

        return length * this.getTypeLength(innerType.getText());
      }
    }

    if (type.match(/^bool\[\d+\]$/)) {
      const lenStr = type.match(/\[\d+]$/)![0].match(/\d+/)![0];
      const length = parseInt(lenStr, 10);

      return Math.ceil(length / 8);
    }

    if (type.match(/\[\d+]$/)) {
      const lenStr = type.match(/\[\d+]$/)![0].match(/\d+/)![0];
      const length = parseInt(lenStr, 10);
      const innerType = type.replace(/\[\d+]$/, '');
      return this.getTypeLength(innerType) * length;
    }

    if (type.startsWith('[')) {
      const tNode = stringToExpression(type);
      if (!ts.isArrayLiteralExpression(tNode)) throw new Error();
      let totalLength = 0;
      let consecutiveBools = 0;

      tNode.elements.forEach((t) => {
        const typeString = t.getText();
        if (typeString === 'bool') {
          consecutiveBools += 1;
        } else {
          if (consecutiveBools > 0) {
            totalLength += Math.ceil(consecutiveBools / 8);
          }

          totalLength += this.getTypeLength(typeString);

          consecutiveBools = 0;
        }
      });

      totalLength += Math.ceil(consecutiveBools / 8);

      return totalLength;
    }

    if (type.match(/<\d+>$/)) {
      return parseInt(type.match(/<\d+>$/)![0].match(/\d+/)![0], 10) * this.getTypeLength(type.match(/\w+/)![0]);
    }

    if (type.match(/uint\d+$/)) {
      return parseInt(type.slice(4), 10) / 8;
    }

    if (type.match(/ufixed\d+x\d+$/)) {
      return parseInt(type.slice(6), 10) / 8;
    }

    if (type.startsWith('{')) {
      const types = Object.values(this.getObjectTypes(type));
      let totalLength = 0;
      let consecutiveBools = 0;
      types.forEach((t) => {
        if (t === 'bool') {
          consecutiveBools += 1;
        } else {
          if (consecutiveBools > 0) {
            totalLength += Math.ceil(consecutiveBools / 8);
          }

          totalLength += this.getTypeLength(t);

          consecutiveBools = 0;
        }
      });

      totalLength += Math.ceil(consecutiveBools / 8);

      return totalLength;
    }

    switch (type) {
      case 'asset':
      case 'application':
        return 8;
      case 'byte':
      case 'string':
      case 'bytes':
        return 1;
      case 'address':
      case 'account':
        return 32;
      default:
        throw new Error(`Unknown type ${JSON.stringify(type, null, 2)}`);
    }
  }

  private getStaticArrayLength(node: ts.ExpressionWithTypeArguments): number {
    if (node.typeArguments === undefined || node.typeArguments.length !== 2) throw new Error();
    const lengthNode = node.typeArguments[1];

    if (ts.isLiteralTypeNode(lengthNode)) return parseInt(lengthNode.getText(), 10);
    if (ts.isTypeQueryNode(lengthNode)) {
      const value = this.constants[lengthNode.exprName.getText()];
      return parseInt(value.getText(), 10);
    }

    throw Error(ts.SyntaxKind[lengthNode.kind]);
  }

  private getABIType(type: string): string {
    const abiType = (this.customTypes[type] ? this.customTypes[type] : type)
      .split('\n')
      .map((line) => {
        if (line.trim().startsWith('//')) return '';
        return line.split('//')[0].trim().replace(/\s+/g, ' ');
      })
      .join(' ');

    if (abiType.endsWith('}')) return abiType;

    const txnTypes: Record<string, string> = {
      Transaction: 'txn',
      AppCallTxn: 'appl',
      AssetConfigTxn: 'acfg',
      AssetFreezeTxn: 'afrz',
      AssetTransferTxn: 'axfer',
      KeyRegTxn: 'keyreg',
      PayTxn: 'pay',
      InnerPayment: 'pay',
      InnerAppCall: 'appl',
      InnerAssetTransfer: 'axfer',
      InnerAssetConfig: 'acfg',
      InnerAssetCreation: 'acfg',
      InnerAssetFreeze: 'afrz',
      InnerOnlineKeyRegistration: 'keyreg',
      InnerOfflineKeyRegistration: 'keyreg',
    };

    if (txnTypes[type]) return txnTypes[type];

    if (type.startsWith('InnerMethodCall')) return 'appl';

    if (type === 'boolean') return 'bool';
    if (type === 'number') return 'uint64';

    const typeNode = stringToExpression(abiType);

    if (abiType.startsWith('Static')) {
      if (!ts.isExpressionWithTypeArguments(typeNode)) throw new Error();
      const innerType = typeNode!.typeArguments![0];
      const length = this.getStaticArrayLength(typeNode);

      return `${this.getABIType(innerType.getText())}[${length}]`;
    }

    if (abiType.match(/\[\]$/)) {
      const baseType = abiType.replace(/\[\]$/, '');
      return `${this.getABIType(baseType)}[]`;
    }

    if (abiType.match(/\[\d+\]$/)) {
      const baseType = abiType.replace(/\[\d+\]$/, '');
      return `${this.getABIType(baseType)}${abiType.match(/\[\d+\]$/)![0]}`;
    }

    if (abiType.startsWith('[')) {
      if (!ts.isArrayLiteralExpression(typeNode)) throw new Error();

      return `[${typeNode.elements.map((t) => this.getABIType(t.getText())).join(',')}]`;
    }

    if (abiType.match(/>$/)) {
      return abiType.replace(/ /g, '').replace(',', 'x').replace('<', '').replace('>', '');
    }

    return abiType.toLowerCase();
  }

  // This is seperate from this.getABIType because the bracket notation
  // is useful for parsing, but the ABI/appspec JSON need the parens
  private getABITupleString(str: string) {
    let tupleStr = this.getABIType(str);
    const expr = stringToExpression(tupleStr);

    if (tupleStr.startsWith('[') && ts.isArrayLiteralExpression(expr)) {
      const types = expr.elements.map((t) => this.getABITupleString(t.getText()));
      tupleStr = `(${types.join(',')})`;
    }

    if (tupleStr.startsWith('{')) {
      const types = Object.values(this.getObjectTypes(tupleStr))
        .map((t) => this.getABIType(t))
        .map((t) => this.getABITupleString(t));

      tupleStr = `(${types.join(',')})`;
    }

    const trailingBrakcet = /(?<!\[\d*)]/g;
    const leadingBracket = /\[(?!\d*])/g;

    return tupleStr.replace(trailingBrakcet, ')').replace(leadingBracket, '(').toLocaleLowerCase();
  }

  private getObjectTypes(givenType: string): Record<string, string> {
    let type = givenType;

    if (this.customTypes[type]) {
      type = this.customTypes[type];
    }

    const typeAliasDeclaration = ts.createSourceFile('', `type Dummy = ${type};`, ts.ScriptTarget.ES2022, true)
      .statements[0];

    if (!ts.isTypeAliasDeclaration(typeAliasDeclaration)) throw new Error();
    if (!ts.isTypeLiteralNode(typeAliasDeclaration.type)) throw new Error();

    const types: Record<string, string> = {};
    typeAliasDeclaration.type.members.forEach((m) => {
      if (!ts.isPropertySignature(m)) throw new Error();

      types[m.name.getText()] = m.type!.getText();
    });

    return types;
  }

  private async postProcessTeal(input: NodeAndTEAL[]): Promise<NodeAndTEAL[]> {
    const compilerOptions = {
      filename: this.filename,
      algodPort: this.algodPort,
      algodServer: this.algodServer,
      algodToken: this.algodToken,
      disableWarnings: this.disableWarnings,
      disableOverflowChecks: this.disableOverflowChecks,
      disableTypeScript: this.disableTypeScript,
    };

    return (
      await Promise.all(
        input.map(async (t) => {
          const tealLine = t.teal;

          if (tealLine.startsWith('#pragma')) {
            return { teal: `#pragma version ${this.programVersion}`, node: t.node };
          }

          if (tealLine.startsWith('PENDING_SCHEMA')) {
            const c = new Compiler(this.content, tealLine.split(' ')[1], compilerOptions);
            await c.compile();
            if (tealLine.startsWith('PENDING_SCHEMA_GLOBAL_INT')) {
              return { teal: `int ${c.appSpec().state.global.num_uints}`, node: t.node };
            }
            if (tealLine.startsWith('PENDING_SCHEMA_GLOBAL_BYTES')) {
              return { teal: `int ${c.appSpec().state.global.num_byte_slices}`, node: t.node };
            }
            if (tealLine.startsWith('PENDING_SCHEMA_LOCAL_INT')) {
              return { teal: `int ${c.appSpec().state.local.num_uints}`, node: t.node };
            }
            if (tealLine.startsWith('PENDING_SCHEMA_LOCAL_BYTES')) {
              return { teal: `int ${c.appSpec().state.local.num_byte_slices}`, node: t.node };
            }
          }

          if (tealLine.startsWith('PENDING_COMPILE')) {
            const contractName = tealLine.split(' ')[1];
            let content: string;

            if (this.importRegistry[contractName]) {
              content = readFileSync(this.importRegistry[contractName], 'utf8');
              compilerOptions.filename = this.importRegistry[contractName];
            } else {
              content = this.content;
            }

            const c = new Compiler(content, contractName, compilerOptions);
            await c.compile();

            if (tealLine.split(':')[0].endsWith('ADDR')) {
              const compiledProgram = await c.algodCompileProgram('lsig');
              return { teal: `addr ${compiledProgram.hash}`, node: t.node };
            }

            const target = tealLine.split(':')[0].split('_').at(-1)!.toLowerCase() as 'approval' | 'clear' | 'lsig';
            const compiledProgram = await c.algodCompileProgram(target);
            return { teal: `byte b64 ${compiledProgram.result}`, node: t.node };
          }

          const method = tealLine.split(' ')[1];
          const subroutine = this.subroutines.find((s) => s.name === method);

          if (tealLine.startsWith('PENDING_PROTO')) {
            if (subroutine === undefined) throw new Error(`Subroutine ${method} not found`);

            let teal = `proto ${subroutine.args.length} ${subroutine.returns.type === 'void' ? 0 : 1}`;

            if (this.frameSize[method]) teal += `; byte 0x`;
            if (this.frameSize[method] > 1) teal += `; dupn ${this.frameSize[method] - 1}`;

            return {
              node: t.node,
              teal,
            };
          }

          return { node: t.node, teal: tealLine };
        })
      )
    ).flat();
  }

  private getTypeScriptDiagnostics() {
    Compiler.diagsRan.push(this.filename);

    const project = new Project({
      useInMemoryFileSystem: true,
      compilerOptions: {
        target: ts.ScriptTarget.ES2022,
        skipLibCheck: true,
        experimentalDecorators: true,
        paths: {
          '@algorandfoundation/tealscript': ['./src/lib/index'],
        },
      },
    });

    let { content } = this;

    content = content.replace(this.tealscriptImport, 'src/lib/index');

    // TODO: figure out how to embed these files for webpack
    project.createSourceFile(
      'types/global.d.ts',
      readFileSync(path.join(__dirname, '../../types/global.d.ts'), 'utf8')
    );
    project.createSourceFile('src/lib/index.ts', readFileSync(path.join(__dirname, 'index.ts'), 'utf8'));
    project.createSourceFile('src/lib/contract.ts', readFileSync(path.join(__dirname, 'contract.ts'), 'utf8'));
    project.createSourceFile('src/lib/lsig.ts', readFileSync(path.join(__dirname, 'lsig.ts'), 'utf8'));
    Object.values(this.importRegistry).forEach((p) => {
      project.createSourceFile(p, readFileSync(p, 'utf8'));
    });
    const sourceFile = project.createSourceFile(this.filename, content);

    const diags = sourceFile.getPreEmitDiagnostics();

    if (diags.length > 0) {
      throw Error(`TypeScript diagnostics failed\n${project.formatDiagnosticsWithColorAndContext(diags)}`);
    }
  }

  /**
   * Get all of the children of the class declaration so the ordering of method definition
   * doesn't matter. Eventually also use this to get properties for the sake of inheritance.
   */
  getClassChildren() {
    this.sourceFile.statements.forEach((body) => {
      if (!ts.isClassDeclaration(body)) return;

      if (body.name!.text !== this.name) return;

      body.forEachChild((node) => {
        if (ts.isMethodDeclaration(node)) {
          if (!ts.isIdentifier(node.name)) throw Error('Method name must be identifier');
          if (node.type === undefined)
            throw Error(`A return type annotation must be defined for ${node.name.getText()}`);

          const returnType = this.getABIType(node.type.getText()).replace(/bytes/g, 'byte[]');

          const sub = {
            name: node.name.getText(),
            allows: { call: [], create: [] },
            nonAbi: { call: [], create: [] },
            args: [],
            desc: '',
            returns: { type: returnType, desc: '' },
            node,
          } as Subroutine;

          new Array(...node.parameters).reverse().forEach((p) => {
            sub.args.push({
              name: p.name.getText(),
              type: this.getABIType(this.getABIType(p!.type!.getText())),
              desc: '',
            });
          });

          this.subroutines.push(sub);
        }
      });
    });
  }

  async compile() {
    this.sourceFile.statements.forEach((body) => {
      if (ts.isImportDeclaration(body)) {
        body.importClause!.namedBindings!.forEachChild((b) => {
          const className = b.getText();
          if (className === 'Contract' || className === 'LogicSig') {
            this.tealscriptImport = body.moduleSpecifier.getText().slice(1, -1);
          } else {
            this.contractClasses.push(className);
            let importPath = body.moduleSpecifier.getText().slice(1, -1);

            if (!importPath.endsWith('.ts')) {
              importPath += '.ts';
            }

            importPath = path.join(path.dirname(this.filename), importPath);

            this.importRegistry[className] = importPath;
          }
        });
      }
    });

    if (!Compiler.diagsRan.includes(this.filename) && !this.disableTypeScript) {
      this.getTypeScriptDiagnostics();
    }

    this.sourceFile.statements.forEach((body) => {
      if (ts.isTypeAliasDeclaration(body)) {
        this.customTypes[body.name.getText()] = body.type.getText();
      }

      if (ts.isVariableStatement(body)) {
        if (body.declarationList.flags !== ts.NodeFlags.Const) throw new Error('Top-level variables must be constants');
        body.declarationList.declarations.forEach((d) => {
          this.constants[d.name.getText()] = d.initializer!;
        });
      }
    });

    this.getClassChildren();

    this.sourceFile.statements.forEach((body) => {
      if (!ts.isClassDeclaration(body)) return;

      this.lastNode = body;

      if (body.heritageClauses === undefined || !ts.isIdentifier(body.heritageClauses[0].types[0].expression)) return;

      const superClass = body.heritageClauses[0].types[0].expression.text;
      if ([CONTRACT_CLASS, LSIG_CLASS].includes(superClass)) {
        const className = body.name!.text;
        if (superClass === CONTRACT_CLASS) this.contractClasses.push(className);
        else this.lsigClasses.push(className);

        if (className === this.name) {
          this.abi = {
            name: className,
            desc: '',
            methods: [],
          };

          if (superClass === LSIG_CLASS) this.currentProgram = 'lsig';
          this.processNode(body);
        }
      }
    });

    if (
      this.currentProgram !== 'lsig' &&
      this.subroutines.map((a) => a.allows.create).flat().length === 0 &&
      !Object.values(this.bareCallConfig)
        .map((c) => c.action)
        .includes('CREATE')
    ) {
      const name = 'createApplication';
      const m = {
        name,
        desc: 'The default create method generated by TEALScript',
        returns: { type: 'void', desc: '' },
        args: [],
      };

      this.subroutines.push({
        ...m,
        allows: { create: ['NoOp'], call: [] },
        nonAbi: {
          create: [],
          call: [],
        },
        node: this.classNode,
      });

      this.abi.methods.push(m);

      this.pushLines(this.classNode, `abi_route_${name}:`, 'int 1', 'return');
    }

    if (this.currentProgram !== 'lsig') this.routeAbiMethods();

    Object.keys(this.compilerSubroutines).forEach((sub) => {
      if (this.teal[this.currentProgram].map((t) => t.teal).includes(`callsub ${sub}`)) {
        this.pushLines(this.classNode, ...this.compilerSubroutines[sub]());
      }
    });

    this.teal[this.currentProgram] = await this.postProcessTeal(this.teal[this.currentProgram]);
    this.teal[this.currentProgram] = optimizeTeal(this.teal[this.currentProgram]);
    this.teal[this.currentProgram] = this.prettyTeal(this.teal[this.currentProgram]);

    this.teal[this.currentProgram].forEach((t, i) => {
      if (t.teal.length === 0 || t.teal.trim().startsWith('//') || t.teal.trim().split(' ')[0].endsWith(':')) return;
      this.srcMap.push({
        teal: i + 1,
        source: ts.getLineAndCharacterOfPosition(this.sourceFile, t.node.getStart()).line + 1,
      });
    });

    let hasNonAbi = false;

    this.subroutines.forEach((sub) => {
      if (sub.nonAbi.call.length + sub.nonAbi.create.length > 0) {
        hasNonAbi = true;
      }
    });

    if (hasNonAbi) {
      const i = this.teal[this.currentProgram].map((t) => t.teal).findIndex((t) => t.includes('[ ARC4 ]'));
      this.teal[this.currentProgram][i].teal =
        '// !!!! WARNING: This contract is *NOT* ARC4 compliant. It may contain ABI methods, but it also allows app calls where the first argument does NOT match an ABI selector';
    }

    this.abi.methods = this.abi.methods.map((m) => ({
      ...m,
      args: m.args.map((a) => ({ ...a, type: this.getABITupleString(a.type) })),
      returns: { ...m.returns, type: this.getABITupleString(m.returns.type) },
    }));

    this.abi.methods.forEach((method) => {
      const m = method;
      const subroutine = this.subroutines.find((s) => s.name === m.name);

      if (subroutine === undefined) throw Error(`Subroutine ${m.name} not found`);

      const comment = subroutine.desc;
      if (comment === '') return;

      try {
        const tsdocParser = new tsdoc.TSDocParser();
        const { docComment } = tsdocParser.parseString(comment);

        m.desc = renderDocNode(docComment.summarySection);

        docComment.params.blocks.forEach((p) => {
          const arg = m.args.find((a) => a.name === p.parameterName);

          if (arg === undefined) throw new Error(`${p.parameterName} is not an argument of ${m.name}`);

          arg.desc = renderDocNode(p.content);
        });

        if (docComment.returnsBlock) {
          m.returns.desc = renderDocNode(docComment.returnsBlock.content);
        }
      } catch (e) {
        // eslint-disable-next-line no-console
        if (!this.disableWarnings) console.warn(`Error when parsing tsdoc comment for ${m.name}: ${e}`);
      }
    });

    if (this.currentProgram === 'lsig') return;

    // Start of clear program compiliation

    this.currentProgram = 'clear';

    this.teal.clear
      .map((t) => t.teal)
      .forEach((t) => {
        if (t.startsWith('callsub')) {
          const subNode = this.subroutines.find((s) => s.name === t.split(' ')[1]);
          if (subNode === undefined) return;
          this.processNode(subNode.node);
        }
      });

    this.teal.clear = await this.postProcessTeal(this.teal.clear);
    this.teal.clear = optimizeTeal(this.teal.clear);
    this.teal.clear = this.prettyTeal(this.teal.clear);
  }

  private push(node: ts.Node, teal: string, type: string) {
    this.lastNode = node;

    if (type !== 'void') this.lastType = type;

    this.teal[this.currentProgram].push({ teal, node });
  }

  private pushVoid(node: ts.Node, teal: string) {
    this.push(node, teal, 'void');
  }

  private getSignature(subroutine: ABIMethod): string {
    const abiArgs = subroutine.args.map((a) => this.getABITupleString(a.type));

    let abiReturns = subroutine.returns.type;

    switch (abiReturns) {
      case 'asset':
      case 'application':
        abiReturns = 'uint64';
        break;
      case 'account':
        abiReturns = 'address';
        break;
      default:
        break;
    }

    return `${subroutine.name}(${abiArgs.join(',')})${this.getABITupleString(abiReturns)}`;
  }

  private pushMethod(subroutine: ABIMethod) {
    this.pushVoid(this.lastNode, `method "${this.getSignature(subroutine)}"`);
  }

  private routeAbiMethods() {
    const switchIndex = this.teal[this.currentProgram].map((t) => t.teal).findIndex((t) => t.startsWith('switch '));

    ON_COMPLETES.forEach((onComplete) => {
      if (onComplete === 'ClearState') return;
      ['create', 'call'].forEach((a) => {
        const methods = this.abi.methods.filter((m) => {
          const subroutine = this.subroutines.find((s) => s.name === m.name)!;
          return subroutine.allows[a as 'call' | 'create'].includes(onComplete);
        });

        if (methods.length === 0 && this.bareCallConfig[onComplete] === undefined) {
          this.teal[this.currentProgram][switchIndex].teal = this.teal[this.currentProgram][switchIndex].teal.replace(
            `${a}_${onComplete}`,
            'NOT_IMPLEMENTED'
          );
          return;
        }

        this.pushVoid(this.classNode, `${a}_${onComplete}:`);

        if (a.toUpperCase() === this.bareCallConfig[onComplete]?.action) {
          this.pushLines(this.classNode, 'txn NumAppArgs', `bz abi_route_${this.bareCallConfig[onComplete]!.method}`);
        }

        if (methods.length === 0) {
          this.pushVoid(this.classNode, 'err');
          return;
        }

        methods.forEach((m) => {
          this.pushMethod(m);
        });

        this.pushLines(
          this.classNode,
          'txna ApplicationArgs 0',
          `match ${methods.map((m) => `abi_route_${m.name}`).join(' ')}`
        );

        const nonAbi = this.subroutines.find((s) => s.nonAbi[a as 'call' | 'create'].includes(onComplete));

        if (nonAbi) {
          this.pushLines(this.classNode, '// !!!! WARNING: non-ABI routing', `callsub ${nonAbi.name}`);
        } else {
          this.pushVoid(this.classNode, 'err');
        }
      });
    });

    if (this.teal[this.currentProgram][switchIndex].teal.endsWith('NOT_IMPLEMENTED')) {
      const removeLastDuplicates = (array: string[]) => {
        let lastIndex = array.length - 1;
        const element = array[lastIndex];
        while (array[lastIndex] === element && lastIndex >= 0) {
          array.pop();
          lastIndex--;
        }
        return array;
      };

      const switchLine = removeLastDuplicates(this.teal[this.currentProgram][switchIndex].teal.split(' ')).join(' ');

      this.teal[this.currentProgram][switchIndex].teal = switchLine;
    }
  }

  private maybeValue(node: ts.Node, opcode: string, type: string) {
    this.pushVoid(node, opcode);
    this.push(node, 'assert', type);
  }

  private hasMaybeValue(node: ts.Node, opcode: string) {
    this.pushVoid(node, opcode);
    this.pushVoid(node, 'swap');
    this.push(node, 'pop', StackType.uint64);
  }

  private pushComments(node: ts.Node) {
    const commentRanges = [
      ...(ts.getLeadingCommentRanges(this.sourceFile.text, node.pos) || []),
      ...(ts.getTrailingCommentRanges(this.sourceFile.text, node.pos) || []),
    ];
    commentRanges.forEach((c) => {
      const comment = this.sourceFile.text.slice(c.pos, c.end);
      if (comment.startsWith('///') && !this.comments.includes(c.pos)) {
        this.pushVoid(this.lastNode, comment.replace('///', '//'));
        this.comments.push(c.pos);
      }
    });
  }

  private processThrowStatement(node: ts.ThrowStatement) {
    if (!ts.isCallExpression(node.expression)) throw Error('Must throw Error');
    if (node.expression.expression.getText() !== 'Error') throw Error('Must throw Error');

    if (node.expression.arguments.length) this.pushVoid(node, `err // ${node.expression.arguments[0].getText()}`);
    else this.pushVoid(node, 'err');
  }

  private processDoStatement(node: ts.DoStatement) {
    this.pushVoid(node, `do_while_${this.doWhileCount}:`);
    this.processNode(node.statement);
    this.processNode(node.expression);
    this.pushVoid(node, `bnz do_while_${this.doWhileCount}`);
  }

  private processWhileStatement(node: ts.WhileStatement) {
    this.pushVoid(node, `while_${this.whileCount}:`);
    this.processNode(node.expression);
    this.pushVoid(node, `bz while_${this.whileCount}_end`);

    this.processNode(node.statement);
    this.pushVoid(node, `b while_${this.whileCount}`);
    this.pushVoid(node, `while_${this.whileCount}_end:`);

    this.whileCount += 1;
  }

  private processForStatement(node: ts.ForStatement) {
    this.processNode(node.initializer!);

    this.pushVoid(node, `for_${this.forCount}:`);
    this.processNode(node.condition!);
    this.pushVoid(node, `bz for_${this.forCount}_end`);

    this.processNode(node.statement);

    this.processNode(node.incrementor!);
    this.pushVoid(node, `b for_${this.forCount}`);
    this.pushVoid(node, `for_${this.forCount}_end:`);

    this.forCount += 1;
  }

  /**
   * Every node in the AST is passed through this function.
   */
  private processNode(node: ts.Node) {
    this.pushComments(node);

    // See comment on topLevelNode property for explanation
    let isTopLevelNode = false;

    if (
      !ts.isClassDeclaration(node) &&
      !ts.isMethodDeclaration(node) &&
      !ts.isBlock(node) &&
      !ts.isExpressionStatement(node) &&
      !ts.isNonNullExpression(node)
    ) {
      if (this.nodeDepth === 0) {
        this.topLevelNode = node;
        isTopLevelNode = true;
      }
      this.nodeDepth += 1;
    }

    try {
      if (ts.isClassDeclaration(node)) this.processClassDeclaration(node);
      else if (ts.isPropertyDeclaration(node)) this.processPropertyDefinition(node);
      else if (ts.isMethodDeclaration(node)) this.processMethodDefinition(node);
      else if (ts.isPropertyAccessExpression(node)) this.processExpressionChain(node);
      else if (ts.isAsExpression(node)) this.processTypeCast(node);
      else if (ts.isTypeAssertionExpression(node)) this.processTypeCast(node);
      else if (ts.isNewExpression(node)) this.processNewExpression(node);
      else if (ts.isArrayLiteralExpression(node)) this.processArrayLiteralExpression(node);
      else if (ts.isNonNullExpression(node)) this.processNode(node.expression);
      else if (ts.isObjectLiteralExpression(node)) this.processObjectLiteralExpression(node);
      else if (node.kind === 108) this.lastType = 'this';
      else if (ts.isThrowStatement(node)) this.processThrowStatement(node);
      else if (ts.isWhileStatement(node)) this.processWhileStatement(node);
      else if (ts.isForStatement(node)) this.processForStatement(node);
      else if (ts.isDoStatement(node)) this.processDoStatement(node);
      // Vars/Consts
      else if (ts.isIdentifier(node)) this.processIdentifier(node);
      else if (ts.isVariableDeclarationList(node)) this.processVariableDeclaration(node);
      else if (ts.isVariableDeclaration(node)) this.processVariableDeclarator(node);
      else if (ts.isNumericLiteral(node) || ts.isStringLiteral(node)) this.processLiteral(node);
      // Logical
      else if (ts.isBlock(node)) this.processBlockStatement(node);
      else if (ts.isIfStatement(node)) this.processIfStatement(node);
      else if (ts.isPrefixUnaryExpression(node)) this.processUnaryExpression(node);
      else if (ts.isBinaryExpression(node)) this.processBinaryExpression(node);
      else if (ts.isCallExpression(node)) this.processExpressionChain(node);
      else if (ts.isExpressionStatement(node)) this.processExpressionStatement(node);
      else if (ts.isReturnStatement(node)) this.processReturnStatement(node);
      else if (ts.isParenthesizedExpression(node)) this.processNode(node.expression);
      else if (ts.isVariableStatement(node)) this.processNode(node.declarationList);
      else if (ts.isElementAccessExpression(node)) this.processExpressionChain(node);
      else if (ts.isConditionalExpression(node)) this.processConditionalExpression(node);
      else if (node.kind === ts.SyntaxKind.TrueKeyword) this.push(node, 'int 1', 'bool');
      else if (node.kind === ts.SyntaxKind.FalseKeyword) this.push(node, 'int 0', 'bool');
      else throw new Error(`Unknown node type: ${ts.SyntaxKind[node.kind]} (${node.kind})`);
    } catch (e) {
      if (!(e instanceof Error)) throw e;

      // Because this is recursive, we need to keep track of the error from
      // the node that actually caused the error and ignore all other error messages
      this.processErrorNodes.push(node);

      const errNode = this.processErrorNodes[0];
      const loc = ts.getLineAndCharacterOfPosition(this.sourceFile, errNode.pos);
      const lines: string[] = [];
      errNode
        .getText()
        .split('\n')
        .forEach((l: string, i: number) => {
          lines.push(`${this.filename}:${loc.line + i + 1}: ${l}`);
        });

      const msg = `TEALScript can not process ${ts.SyntaxKind[errNode.kind]} at ${this.filename}:${loc.line}:${
        loc.character
      }\n    ${lines.join('\n    ')}\n`;

      e.message = `${e.message.replace(`\n${msg}`, '')}\n${msg}`;

      throw e;
    }

    if (isTopLevelNode) this.nodeDepth = 0;
  }

  private processObjectLiteralExpression(node: ts.ObjectLiteralExpression) {
    const type = this.typeHint;
    if (type === undefined) throw new Error();
    const elements: ts.Expression[] = [];

    const objTypes = this.getObjectTypes(type);

    node.properties.forEach((p) => {
      if (!ts.isPropertyAssignment(p)) throw new Error();
      elements[Object.keys(objTypes).indexOf(p.name.getText())] = p.initializer;
    });

    this.processArrayElements(elements, node);
  }

  private processConditionalExpression(node: ts.ConditionalExpression) {
    const tc = this.ternaryCount;
    this.ternaryCount += 1;

    this.processNode(node.condition);
    this.pushVoid(node, `bz ternary${tc}_false`);
    this.processNode(node.whenTrue);
    this.pushVoid(node, `b ternary${tc}_end`);
    this.pushVoid(node, `ternary${tc}_false:`);
    this.processNode(node.whenFalse);
    this.pushVoid(node, `ternary${tc}_end:`);
  }

  private pushLines(node: ts.Node, ...lines: string[]) {
    lines.forEach((l) => this.push(node, l, 'void'));
  }

  private getarrayElementTypes(elements: number): string[] {
    if (this.typeHint === undefined) throw new Error('Type hint is undefined');
    const typeHintNode = stringToExpression(this.getABIType(this.typeHint));

    if (ts.isElementAccessExpression(typeHintNode)) {
      const type = typeHintNode.expression.getText().replace(/\[\]$/, '');

      return new Array(elements).fill(type);
    }

    if (ts.isArrayLiteralExpression(typeHintNode)) {
      return typeHintNode.elements.map((e) => this.getABIType(e.getText()));
    }

    if (ts.isIdentifier(typeHintNode)) {
      return new Array(elements).fill(this.typeHint);
    }

    if (ts.isTypeLiteralNode(typeHintNode)) {
      return typeHintNode.members.map((m) => {
        if (!ts.isPropertySignature(m)) throw new Error();

        return this.getABIType(m.type!.getText());
      });
    }

    throw new Error(`${ts.SyntaxKind[typeHintNode.kind]}: ${typeHintNode.getText()}`);
  }

  private processBools(nodes: ts.Node[] | ts.NodeArray<ts.Expression>, isDynamicArray: boolean = false) {
    const boolByteLength = Math.ceil(nodes.length / 8);

    if (isDynamicArray) this.pushVoid(nodes[0], `byte 0x${nodes.length.toString(16).padStart(4, '0')}`);
    this.pushVoid(nodes[0], `byte 0x${'00'.repeat(boolByteLength)}`);

    nodes.forEach((n, i) => {
      this.pushVoid(n, `int ${i}`);
      this.processNode(n);
      this.pushVoid(n, 'setbit');
    });

    if (isDynamicArray) this.pushVoid(nodes[0], 'concat');
  }

  private processTuple(elements: ts.Expression[] | ts.NodeArray<ts.Expression>, parentNode: ts.Node) {
    if (this.typeHint === undefined) throw new Error('Type hint is undefined');
    let { typeHint } = this;

    if (!this.getABIType(typeHint).includes(']')) typeHint = `${typeHint}[]`;

    const types = this.getarrayElementTypes(elements.length);

    const dynamicTypes = types.filter((t) => this.isDynamicType(t));
    const staticTypes = types.filter((t) => !this.isDynamicType(t));
    const headLength = this.getTypeLength(`[${staticTypes.join(',')}]`) + dynamicTypes.length * 2;

    const isStatic = !this.isDynamicType(typeHint);

    let consecutiveBools: ts.Node[] = [];
    elements.forEach((e, i) => {
      if (i === 0 && !isStatic) {
        this.pushLines(
          parentNode,
          'byte 0x // initial head',
          'byte 0x // initial tail',
          `byte 0x${headLength.toString(16).padStart(4, '0')} // initial head offset`
        );
      }

      if (types[i] === 'bool') {
        consecutiveBools.push(e);
        return;
      }

      if (consecutiveBools.length > 0) {
        this.processBools(consecutiveBools);
        if (!isStatic) this.pushVoid(e, 'callsub process_static_tuple_element');
        else if (i !== 0) this.pushVoid(e, 'concat');

        consecutiveBools = [];
      }

      this.typeHint = types[i];

      if (ts.isNumericLiteral(e)) {
        this.processNumericLiteralWithType(e, types[i]);
      } else {
        this.processNode(e);
      }

      this.typeComparison(this.lastType, types[i]);
      this.checkEncoding(e, types[i]);

      if (this.isDynamicType(types[i])) this.pushVoid(e, 'callsub process_dynamic_tuple_element');
      else if (!isStatic) this.pushVoid(e, 'callsub process_static_tuple_element');
      else if (i !== 0) this.pushVoid(e, 'concat');
    });

    if (consecutiveBools.length > 0) {
      this.processBools(consecutiveBools);
      if (!isStatic) this.pushVoid(parentNode, 'callsub process_static_tuple_element');
    }

    if (!isStatic) this.pushLines(parentNode, 'pop // pop head offset', 'concat // concat head and tail');
  }

  private checkEncoding(node: ts.Node, type: string) {
    const abiType = this.getABIType(type.replace(/^unsafe /, ''));
    const width = parseInt(abiType.match(/\d+/)?.[0] || '512', 10);

    if (type.startsWith('unsafe')) {
      this.overflowCheck(node, width);
      this.fixBitWidth(node, width);
      this.lastType = abiType;

      return;
    }

    if (this.isDynamicArrayOfStaticType(type)) {
      const baseType = type.replace(/\[\]$/, '');
      if (baseType === 'bool') return;
      const length = this.getTypeLength(baseType);

      this.pushLines(node, 'dup', 'len');
      if (length > 1) {
        this.pushLines(node, `int ${length}`, '/');
      }
      this.pushLines(node, 'itob', 'extract 6 2', 'swap', 'concat');
    } else if (abiType === 'bool') {
      this.pushLines(node, 'byte 0x00', 'int 0', 'uncover 2', 'setbit');
    } else if (isNumeric(abiType)) {
      this.pushLines(node, 'itob');
    }
  }

  private getTupleElement(type: string): TupleElement {
    const expr = stringToExpression(type);

    const elem: TupleElement = new TupleElement(this.getABIType(type), 0);

    let offset = 0;
    let consecutiveBools = 0;

    const processTypeNode = (e: ts.Node) => {
      const abiType = this.getABIType(e.getText());

      if (abiType === 'bool') {
        consecutiveBools += 1;
        elem.add(new TupleElement('bool', offset));
        return;
      }

      if (consecutiveBools) {
        offset += Math.ceil(consecutiveBools / 8);
      }

      if (ts.isArrayLiteralExpression(e) || ts.isTypeLiteralNode(e) || ts.isTypeReferenceNode(e)) {
        const t = new TupleElement(abiType, offset);
        t.add(...this.getTupleElement(abiType));
        elem.add(t);
      } else if (abiType.match(/\[\d*\]$/)) {
        const baseType = abiType.replace(/\[\d*\]$/, '');
        const t = new TupleElement(abiType, offset);
        t.add(this.getTupleElement(baseType));
        elem.add(t);
      } else elem.add(new TupleElement(abiType, offset));

      if (this.isDynamicType(abiType)) {
        offset += 2;
      } else {
        offset += this.getTypeLength(abiType);
      }
    };

    if (ts.isTypeLiteralNode(expr)) {
      expr.members.forEach((m) => {
        if (!ts.isPropertySignature(m)) throw new Error();

        processTypeNode(m.type!);
      });
    }

    if (ts.isArrayLiteralExpression(expr)) {
      expr.elements.forEach((e) => {
        processTypeNode(e);
      });
    }

    if (type.match(/\[\d*\]$/)) {
      const baseType = type.replace(/\[\d*\]$/, '');
      elem.add(this.getTupleElement(baseType));
    }

    return elem;
  }

  private processArrayElements(elements: ts.Expression[] | ts.NodeArray<ts.Expression>, parentNode: ts.Node) {
    const typeHint = this.getABIType(this.typeHint!);
    if (typeHint === undefined) throw Error('Type hint must be provided to process object or array');

    const baseType = this.getABIType(typeHint).replace(/\[\d*\]$/, '');

    if (this.isDynamicType(baseType) || (typeHint.startsWith('[') && !typeHint.match(/\[\d*\]$/))) {
      this.processTuple(elements, parentNode);
      if (this.getABIType(typeHint).endsWith('[]')) {
        this.pushLines(parentNode, `byte 0x${elements.length.toString(16).padStart(4, '0')}`, 'swap', 'concat');
      }
      this.lastType = this.getABIType(typeHint);
      return;
    }

    const types = this.getarrayElementTypes(elements.length);
    const arrayTypeHint = typeHint;

    if (arrayTypeHint.match(/bool\[\d*\]$/)) {
      this.processBools(elements, arrayTypeHint.endsWith('[]'));
    } else {
      elements.forEach((e, i) => {
        this.typeHint = types[i];

        if (ts.isNumericLiteral(e)) {
          this.processNumericLiteralWithType(e, types[i]);
        } else {
          this.processNode(e);
        }
        this.typeComparison(this.lastType, types[i]);
        this.checkEncoding(e, types[i]);
        if (i) this.pushVoid(parentNode, 'concat');
      });
    }

    const abiArrayType = this.getABIType(arrayTypeHint);

    if (abiArrayType.match(/\[\d+\]$/)) {
      const length = parseInt(abiArrayType.match(/\[\d+\]$/)![0].match(/\d+/)![0], 10);

      if (length && elements.length < length) {
        const typeLength = this.getTypeLength(baseType);
        this.pushVoid(parentNode, `byte 0x${'00'.repeat(typeLength * (length - elements.length))}`);

        if (elements.length > 0) this.pushVoid(parentNode, 'concat');
      }
    }

    this.lastType = this.getABIType(typeHint);
  }

  private processArrayLiteralExpression(node: ts.ArrayLiteralExpression) {
    if (this.typeHint === undefined) throw new Error('Type hint is undefined');
    const { typeHint } = this;

    if (this.getABIType(typeHint).endsWith('[]') && node.elements.length === 0) {
      this.push(node, 'byte 0x', this.getABIType(this.typeHint));
      return;
    }

    this.processArrayElements(node.elements, node);
  }

  /**
   *
   * @param node The top level node to process
   * @param chain The existing expression chain to add to
   * @returns The base expression and reversed expression chain `this.txn.sender` ->
   * `{ chain: [this.txn, this.txn.sender], base: [this] }`
   */
  private getExpressionChain(
    node: ExpressionChainNode,
    chain: ExpressionChainNode[] = []
  ): { chain: ExpressionChainNode[]; base: ts.Node } {
    chain.push(node);

    /**
     * The expression on the given node
     * `this.txn.sender` -> `this.txn`
     */
    let expr: ts.Expression = node.expression;

    /* this.txn.applicationArgs! -> this.txn.applicationArgs */
    if (ts.isNonNullExpression(expr)) {
      expr = expr.expression;
    }

    if (ts.isElementAccessExpression(expr) || ts.isPropertyAccessExpression(expr) || ts.isCallExpression(expr)) {
      return this.getExpressionChain(expr, chain);
    }

    chain.reverse();
    return { base: expr, chain };
  }

  private getAccessChain(node: ts.ElementAccessExpression, chain: ts.ElementAccessExpression[] = []) {
    chain.push(node);

    if (ts.isElementAccessExpression(node.expression)) {
      this.getAccessChain(node.expression, chain);
    }

    return chain;
  }

  /**
   * Given a variable name, this function will return the value that we ultimately need to get from the frame
   *
   * For example:
   *
   * ```ts
   * const x = a[1][2]
   * const y = x[3][4]
   * ```
   *
   * Given `y`, return that we are ultimately accessing `a[1][2][3][4]`
   *
   * @param node The node of the variable that we're accessing
   * @param inputName The name of the variable that we're accessing
   * @param load Whether or not to load the value and put it on the stack. If false, it will just return information about the frame object
   * @returns
   */
  private processFrame(
    node: ts.Node,
    inputName: string,
    load: boolean
  ): {
    /** Access for an array. Ie. `a[0][1]` -> `[0, 1]` */
    accessors: (ts.Expression | string)[];
    /** The name of the frame object */
    name: string;
    /** Whether this is a object saved in the frame or in app storage */
    type: 'frame' | 'storage';
    /** If storage, then this is the storage expression ie. `this.myBoxMap` */
    storageExpression?: ts.PropertyAccessExpression;
    /** If this is a storage map, then this is the name of the frame object holding the map key */
    storageKeyFrame?: string;
    /** If this is local storage, then this is the name of the frame object holding the local account */
    storageAccountFrame?: string;
  } {
    let name = inputName;
    let currentFrame = this.localVariables[inputName];

    let type: 'frame' | 'storage' = 'frame';
    let storageExpression: ts.PropertyAccessExpression | undefined;

    const accessors: (ts.Expression | string)[][] = [];

    /* 
    Walk through the pointers until we get the base frame object
    Each step might include array access, which we need to return
    For example:
    
    ```ts
    const x = a[1][2]
    const y = x[3][4]
    ```

    `y` frame object has the accessor [3,4] and `x` frame object has accessors `[1,2]`, giving us the full access chain `[1,2,3,4]`
    */
    while (currentFrame.framePointer !== undefined) {
      if (currentFrame.accessors) accessors.push(currentFrame.accessors);

      name = currentFrame.framePointer!;
      currentFrame = this.localVariables[name];
    }

    // If the base is saving a storage map or local storage, then we need to get the storage expression
    if (currentFrame.storageExpression !== undefined) {
      if (currentFrame.accessors) accessors.push(currentFrame.accessors);
      // eslint-disable-next-line prefer-destructuring
      name = getStorageName(currentFrame.storageExpression)!;
      type = 'storage';
      storageExpression = currentFrame.storageExpression;
    }

    // If we aren't loading the value, the just retun the information about it
    if (!load) {
      return {
        name,
        type,
        accessors: accessors.reverse().flat(),
        storageExpression,
        storageKeyFrame: currentFrame.storageKeyFrame,
        storageAccountFrame: currentFrame.storageAccountFrame,
      };
    }

    // If we are loading, then either dig from the frame or load from storage
    if (currentFrame.storageExpression !== undefined) {
      this.handleStorageAction({
        node: currentFrame.storageExpression,
        name,
        storageKeyFrame: currentFrame.storageKeyFrame,
        storageAccountFrame: currentFrame.storageAccountFrame,
        action: 'get',
      });
    } else {
      this.push(node, `frame_dig ${currentFrame.index!} // ${name}: ${currentFrame.type}`, currentFrame.type);
    }

    return { name, type, accessors: accessors.reverse().flat() };
  }

  private isArrayType(type: string) {
    const tupleStr = this.getABITupleString(this.getABIType(type));

    return tupleStr.startsWith('(') || tupleStr.endsWith(']');
  }

  private updateValue(node: ts.Node) {
    const currentArgs = this.currentSubroutine.args;
    // Add back to frame/storage if necessary
    if (ts.isIdentifier(node)) {
      const name = node.getText();
      const frameObj = this.localVariables[name];

      if (frameObj.index !== undefined) {
        const { index, type } = this.localVariables[name];
        if (currentArgs.find((s) => s.name === name && this.isArrayType(s.type))) {
          throw Error('Mutating argument array is not allowed. Use "clone()" method to create a deep copy.');
        }

        this.pushVoid(node, `frame_bury ${index} // ${name}: ${type}`);
      } else {
        const processedFrame = this.processFrame(node, name, false);

        if (processedFrame.type === 'frame') {
          const frame = this.localVariables[processedFrame.name];

          if (currentArgs.find((s) => s.name === processedFrame.name && this.isArrayType(s.type))) {
            throw Error('Mutating argument array is not allowed. Use "clone()" method to create a deep copy.');
          }

          this.pushVoid(node, `frame_bury ${frame.index} // ${name}: ${frame.type}`);
        } else {
          // TODO: fix this so box_replace is used when updating a storage ref from frame
          // const { type, valueType } = this.storageProps[processedFrame.name];
          // const action = (type === 'box' && !this.isDynamicType(valueType)) ? 'replace' : 'set';
          this.handleStorageAction({
            node: processedFrame.storageExpression!,
            storageAccountFrame: processedFrame.storageAccountFrame,
            storageKeyFrame: processedFrame.storageKeyFrame,
            action: 'set',
            name: processedFrame.name,
          });
        }
      }
    } else if (ts.isCallExpression(node) || ts.isPropertyAccessExpression(node)) {
      let storageName: string | undefined;

      if (ts.isCallExpression(node)) {
        if (!ts.isPropertyAccessExpression(node.expression)) throw new Error('Must be property access expression');
        storageName = getStorageName(node.expression);
      } else storageName = getStorageName(node);

      const storageProp = this.storageProps[storageName!];

      const { type, valueType } = storageProp;
      const action = type === 'box' && !this.isDynamicType(valueType) ? 'replace' : 'set';

      this.handleStorageAction({
        node,
        name: storageName!,
        action,
      });
    } else {
      throw new Error(`Can't update ${ts.SyntaxKind[node.kind]} array`);
    }
  }

  private compilerSubroutines: { [name: string]: () => string[] } = {
    itoa: () => [
      'intToAscii:',
      'proto 1 1',
      'byte 0x30313233343536373839 // "0123456789"',
      'frame_dig -1 // i: uint64',
      'int 1',
      'extract3',
      'retsub',
      '',
      'itoa:',
      'proto 1 1',
      'frame_dig -1 // i: uint64',
      'int 0',
      '==',
      'bz itoa_if_end',
      'byte 0x151f7c75000130',
      'log',
      'retsub',
      'itoa_if_end:',
      'frame_dig -1 // i: uint64',
      'int 10',
      '/',
      'int 0',
      '>',
      'bz itoa_ternary_false',
      'frame_dig -1 // i: uint64',
      'int 10',
      '/',
      'callsub itoa',
      'b itoa_ternary_end',
      'itoa_ternary_false:',
      'byte 0x // ""',
      'itoa_ternary_end:',
      'frame_dig -1 // i: uint64',
      'int 10',
      '%',
      'callsub intToAscii',
      'concat',
      'retsub',
    ],
    process_static_tuple_element: () => {
      const tupleHead = '-4 // tuple head';
      const tupleTail = '-3 // tuple tail';
      const headOffset = '-2 // head offset';
      const element = '-1 // element';

      return [
        'process_static_tuple_element:',
        'proto 4 3',
        `frame_dig ${tupleHead}`,
        `frame_dig ${element}`,
        'concat',

        `frame_dig ${tupleTail}`,
        `frame_dig ${headOffset}`,
        'retsub',
      ];
    },

    process_dynamic_tuple_element: () => {
      const tupleHead = '-4 // tuple head';
      const tupleTail = '-3 // tuple tail';
      const headOffset = '-2 // head offset';
      const element = '-1 // element';

      return [
        'process_dynamic_tuple_element:',
        'proto 4 3',
        `frame_dig ${tupleHead}`,
        `frame_dig ${headOffset}`,
        'concat',
        `frame_bury ${tupleHead}`,
        `frame_dig ${element}`,
        'dup',
        'len',
        `frame_dig ${headOffset}`,
        'btoi',
        '+',
        'itob',
        'extract 6 2',
        `frame_bury ${headOffset}`,
        `frame_dig ${tupleTail}`,
        'swap',
        'concat',
        `frame_bury ${tupleTail}`,

        `frame_dig ${tupleHead}`,
        `frame_dig ${tupleTail}`,
        `frame_dig ${headOffset}`,
        'retsub',
      ];
    },

    // -2: length difference
    // -1: offset
    update_dynamic_head: () => [
      'update_dynamic_head:',
      'proto 2 0',
      'frame_dig -2 // length difference',
      `load ${compilerScratch.fullArray}`,
      'frame_dig -1 // dynamic array offset',
      'extract_uint16 // extract dynamic array offset',

      `load ${compilerScratch.subtractHeadDifference}`,
      'bz subtract_head_difference',
      '+ // add difference to offset',
      'b end_calc_new_head',

      'subtract_head_difference:',
      'swap',
      '- // subtract difference from offet',

      'end_calc_new_head:',

      'itob // convert to bytes',
      'extract 6 2 // convert to uint16',
      `load ${compilerScratch.fullArray}`,
      'swap',
      'frame_dig -1 // offset',
      'swap',
      'replace3 // update offset',
      `store ${compilerScratch.fullArray}`,
      'retsub',
    ],

    get_length_difference: () => [
      'get_length_difference:',
      // Get new element length
      `load ${compilerScratch.newElement}`,
      'len // length of new element',
      `load ${compilerScratch.elementLength}`,
      '<',

      'bnz swapped_difference',
      `load ${compilerScratch.newElement}`,
      'len // length of new element',
      `load ${compilerScratch.elementLength}`,
      'int 1',
      `store ${compilerScratch.subtractHeadDifference}`,
      'b get_difference',

      'swapped_difference:',
      `load ${compilerScratch.elementLength}`,
      `load ${compilerScratch.newElement}`,
      'len // length of new element',
      'int 0',
      `store ${compilerScratch.subtractHeadDifference}`,

      'get_difference:',
      '- // get length difference',
      `store ${compilerScratch.lengthDifference}`,
      'retsub',
    ],
  };

  private getElementHead(topLevelTuple: TupleElement, accessors: (ts.Expression | string)[], node: ts.Node) {
    let previousTupleElement = topLevelTuple;
    let previousElemIsBool = false;

    // At the end of this forEach, the stack will contain the HEAD offset of the accessed element
    accessors.forEach((acc, i) => {
      if (typeof acc === 'string') {
        if (!acc.startsWith('accessor//')) {
          const index = Object.keys(this.getObjectTypes(previousTupleElement.type)).indexOf(acc);

          const elem = previousTupleElement[index];

          this.pushLines(node, `int ${elem.headOffset} // headOffset`, '+');

          previousTupleElement = elem;
          return;
        }

        const elem = previousTupleElement[0];

        const frame = this.localVariables[acc];

        this.push(node, `frame_dig ${frame.index} // saved accessor: ${acc}`, StackType.uint64);

        this.pushLines(
          node,
          // `int ${accNumber * this.getTypeLength(elem.type)} // acc * typeLength`,
          `int ${this.getTypeLength(elem.type)}`,
          '* // acc * typeLength',
          '+'
        );

        previousTupleElement = elem;
        return;
      }

      const accNumber = parseInt(acc.getText(), 10);

      const elem: TupleElement = Number.isNaN(accNumber)
        ? previousTupleElement[0]
        : previousTupleElement[accNumber] || previousTupleElement[0];

      if (elem.type === 'bool' && !previousElemIsBool) {
        this.pushLines(acc, `int ${elem.headOffset} // headOffset`, '+');

        previousElemIsBool = true;
      } else if (previousTupleElement.arrayType === 'tuple') {
        this.pushLines(acc, `int ${elem.headOffset} // headOffset`, '+');
        // Dynamic element in static or dynamic array
      } else if (this.isDynamicType(elem.type)) {
        if (!Number.isNaN(accNumber)) {
          this.pushLines(acc, `int ${accNumber * 2} // acc * 2`, '+');
        } else {
          this.processNode(acc);

          if (!isNumeric(this.lastType)) this.pushVoid(acc, 'btoi');

          this.pushLines(acc, 'int 2', '* // acc * 2', '+');
        }
        // Static element in array
      } else if (!previousElemIsBool) {
        if (!Number.isNaN(accNumber)) {
          this.pushLines(acc, `int ${accNumber * this.getTypeLength(elem.type)} // acc * typeLength`, '+');
        } else {
          this.processNode(acc);

          if (!isNumeric(this.lastType)) this.pushVoid(acc, 'btoi');

          this.pushLines(acc, `int ${this.getTypeLength(elem.type)}`, '* // acc * typeLength', '+');
        }
      }

      if (
        previousTupleElement.arrayType === 'dynamic' &&
        !(i === 0 && this.isDynamicArrayOfStaticType(previousTupleElement.type))
      ) {
        this.pushLines(acc, 'int 2', '+ // add two for length');
      }

      if (this.isDynamicType(elem.type) && i !== accessors.length - 1) {
        this.pushLines(acc, `load ${compilerScratch.fullArray}`, 'swap', 'extract_uint16');
      }

      previousTupleElement = elem;
    });

    return previousTupleElement;
  }

  private processLiteralStaticTupleAccess(
    node: ts.Node,
    accessors: (ts.Expression | string)[],
    parentExpression: ts.Node,
    newValue?: ts.Node
  ) {
    const parentType = this.getABIType(this.lastType);

    let offset = 0;
    let previousTupleElement = this.getTupleElement(parentType);
    accessors.forEach((acc, i) => {
      let accNumber: number;
      if (typeof acc === 'string') {
        accNumber = Object.keys(this.getObjectTypes(previousTupleElement.type)).indexOf(acc);
      } else accNumber = parseInt((acc as ts.Expression).getText(), 10);

      const elem = previousTupleElement[accNumber] || previousTupleElement[0];

      if (previousTupleElement[accNumber]) offset += elem.headOffset;
      else offset += accNumber * this.getTypeLength(elem.type);

      previousTupleElement = elem;
    });

    const elem = previousTupleElement;

    const length = this.getTypeLength(elem.type);

    // If one of the immediate args is over 255, then replace2/extract won't work
    const over255 = length > 255 || offset > 255;

    const canBoxReplace =
      newValue &&
      ts.isPropertyAccessExpression(parentExpression) &&
      getStorageName(parentExpression) &&
      this.storageProps[getStorageName(parentExpression)!] &&
      this.storageProps[getStorageName(parentExpression)!].type === 'box' &&
      !this.isDynamicType(this.storageProps[getStorageName(parentExpression)!].valueType);

    if (over255 || canBoxReplace) this.pushVoid(node, `int ${offset}`);

    if (newValue) {
      if (ts.isNumericLiteral(newValue)) {
        this.processNumericLiteralWithType(newValue, elem.type);
      } else {
        this.processNode(newValue);
      }

      this.checkEncoding(node, elem.type);

      if (!canBoxReplace) {
        if (over255) this.pushVoid(node, 'replace3');
        else this.pushVoid(node, `replace2 ${offset}`);
      }

      this.updateValue(parentExpression);
    } else {
      if (over255) this.pushLines(node, `int ${length}`, 'extract3');
      else this.pushVoid(node, `extract ${offset} ${length}`);

      this.checkDecoding(node, elem.type);
      this.lastType = elem.type;
    }
  }

  private processParentArrayAccess(
    node: ts.Node,
    accessors: (ts.Expression | string)[],
    parentExpression: ts.Node,
    newValue?: ts.Node
  ): void {
    const parentType = this.getABIType(this.lastType);

    // If we know the tuple is static and doesn't contain bools or dynamic accessors,
    // we can skip all of the opcodes and just use the offset calculated by getElementHead directly
    // TODO: add bool support
    const isNonBoolStatic = !this.isDynamicType(parentType) && !parentType.includes('bool');
    let literalAccessors = true;

    accessors.forEach((a) => {
      if (typeof a === 'string') {
        if (a.startsWith('accessor//')) literalAccessors = false;
        return;
      }

      if (Number.isNaN(parseInt((a as ts.Expression).getText(), 10))) literalAccessors = false;
    });

    if (isNonBoolStatic && literalAccessors) {
      this.processLiteralStaticTupleAccess(node, accessors, parentExpression, newValue);
      return;
    }

    this.pushLines(node, `store ${compilerScratch.fullArray}`, 'int 0 // initial offset');

    const topLevelTuple = this.getTupleElement(parentType);

    const element = this.getElementHead(topLevelTuple, accessors, node);

    const baseType = element.type.replace(/\[\d*\]/, '');

    if (this.isDynamicType(element.type)) {
      if (!['string', 'bytes'].includes(element.type) && this.isDynamicType(baseType)) {
        throw new Error(`Cannot access nested dynamic array element: ${element.type}`);
      }

      if (newValue) {
        this.pushLines(node, 'dup', `store ${compilerScratch.elementHeadOffset}`);
      }

      this.pushLines(
        node,
        `load ${compilerScratch.fullArray}`,
        `load ${compilerScratch.fullArray}`,
        'uncover 2',
        'extract_uint16'
      );

      if (element.parent!.type.endsWith('[]')) {
        this.pushLines(node, 'int 2', '+ // add two for length');
      }

      if (newValue) {
        this.pushLines(node, 'dup', `store ${compilerScratch.elementStart}`);
      }

      this.pushLines(
        node,
        'dup // duplicate start of element',
        `load ${compilerScratch.fullArray}`,
        'swap',
        'extract_uint16 // get number of elements',
        `int ${this.getTypeLength(baseType)} // get type length`,
        '* // multiply by type length',
        'int 2',
        '+ // add two for length'
      );

      this.pushVoid(node, newValue ? `store ${compilerScratch.elementLength}` : 'extract3');
    }

    if (newValue) {
      if (this.isDynamicType(element.type)) {
        if (element.parent?.arrayType !== 'tuple') {
          throw new Error(
            'Updating nested dynamic array elements not yet supported. The entire array must be overwritten to change a value'
          );
        }
        // Get pre element
        this.pushLines(
          node,
          `load ${compilerScratch.fullArray}`,
          'int 0',
          `load ${compilerScratch.elementStart}`,
          'substring3'
        );

        // Get new element
        if (ts.isNumericLiteral(newValue)) {
          this.processNumericLiteralWithType(newValue, element.type);
        } else {
          this.processNode(newValue);
        }

        this.checkEncoding(newValue, this.lastType);

        this.pushLines(newValue, 'dup', `store ${compilerScratch.newElement}`);

        // Get post element
        this.pushLines(
          node,
          `load ${compilerScratch.fullArray}`,
          `load ${compilerScratch.elementStart}`,
          `load ${compilerScratch.elementLength}`,
          '+ // get end of Element',
          `load ${compilerScratch.fullArray}`,
          'len',
          'substring3'
        );

        // Form new tuple
        this.pushLines(node, 'concat', 'concat', `store ${compilerScratch.fullArray}`);

        // Get length difference
        this.pushLines(node, 'callsub get_length_difference');

        const elementIndex = element.parent!.findIndex((e) => e.id === element.id);

        const nextDynamicSiblings = element.parent!.slice(elementIndex + 1).filter((e) => this.isDynamicType(e.type));

        const headDiffs = nextDynamicSiblings.map((e) => e.headOffset - element.headOffset);

        headDiffs.forEach((diff) => {
          this.pushLines(
            node,
            `load ${compilerScratch.lengthDifference}`,
            `load ${compilerScratch.elementHeadOffset}`,
            `int ${diff}`,
            '+ // head ofset',
            'callsub update_dynamic_head'
          );
        });

        this.pushVoid(node, `load ${compilerScratch.fullArray}`);
      } else if (element.type === 'bool') {
        if (!ts.isElementAccessExpression(node)) throw new Error();

        this.pushLines(node.argumentExpression, 'int 8', '* // get bit offset');
        this.processNode(node.argumentExpression);
        this.pushLines(node.argumentExpression, '+ // add accessor bits');
        if (element.parent!.arrayType === 'dynamic') {
          this.pushLines(node.argumentExpression, 'int 16', '+ // 16 bits for length prefix');
        }
        this.pushLines(node.argumentExpression, `load ${compilerScratch.fullArray}`, 'swap');
        this.processNode(newValue);

        this.pushVoid(node.argumentExpression, 'setbit');
      } else {
        this.pushLines(node, `load ${compilerScratch.fullArray}`, 'swap');
        this.processNode(newValue);
        this.checkEncoding(newValue, this.lastType);
        this.pushVoid(node, 'replace3');
      }

      this.updateValue(parentExpression);
    } else {
      if (element.type === 'bool') {
        if (!ts.isElementAccessExpression(node)) throw new Error(`${ts.SyntaxKind[node.kind]}: ${node.getText()}`);

        this.pushLines(node.argumentExpression, 'int 8', '*');
        this.processNode(node.argumentExpression);
        this.pushLines(node.argumentExpression, '+', `load ${compilerScratch.fullArray}`, 'swap', 'getbit');

        this.lastType = 'bool';
        return;
      }

      if (!this.isDynamicType(element.type)) {
        this.pushLines(
          node,
          `load ${compilerScratch.fullArray}`,
          'swap',
          `int ${this.getTypeLength(element.type)}`,
          'extract3'
        );
      }

      this.checkDecoding(node, element.type);

      this.lastType = element.type.replace('string', 'bytes');
    }
  }

  private processMethodDefinition(node: ts.MethodDeclaration) {
    if (!ts.isIdentifier(node.name)) throw Error('Method name must be identifier');
    if (node.type === undefined) throw Error(`A return type annotation must be defined for ${node.name.getText()}`);

    const returnType = this.getABIType(node.type.getText()).replace(/bytes/g, 'byte[]');

    this.currentSubroutine = this.subroutines.find((s) => s.name === node.name.getText())!;

    const leadingCommentRanges = ts.getLeadingCommentRanges(this.sourceFile.text, node.pos) || [];
    const headerCommentRange = leadingCommentRanges.at(-1);
    if (headerCommentRange) {
      const comment = this.sourceFile.text.slice(headerCommentRange.pos, headerCommentRange.end);
      this.currentSubroutine.desc = comment;
    }

    if (!node.body) throw new Error(`A method body must be defined for ${node.name.getText()}`);

    if (node.modifiers && node.modifiers[0].kind === ts.SyntaxKind.PrivateKeyword) {
      this.processSubroutine(node);
      return;
    }

    if (this.currentProgram === 'lsig' && node.name.getText() !== 'logic') {
      throw Error('Only one method called "logic" can be defined in a logic signature');
    }

    if (this.currentProgram === 'lsig' && returnType !== 'void')
      throw Error('logic method must have a void return type');

    this.currentSubroutine.allows = { create: [], call: [] };
    let bareAction = false;

    const n = this.currentSubroutine.name;
    if (
      [
        'createApplication',
        'updateApplication',
        'deleteApplication',
        'optInToApplication',
        'closeOutOfApplication',
        'clearState',
      ].includes(n)
    ) {
      const isCreate = this.currentSubroutine.name === 'createApplication';
      let oc: OnComplete;

      if (n === 'createApplication') oc = 'NoOp';
      else if (n === 'updateApplication') oc = 'UpdateApplication';
      else if (n === 'deleteApplication') oc = 'DeleteApplication';
      else if (n === 'optInToApplication') oc = 'OptIn';
      else if (n === 'closeOutOfApplication') oc = 'CloseOut';
      else if (n === 'clearState') oc = 'ClearState';
      else throw Error();

      const action = isCreate ? 'create' : 'call';

      this.currentSubroutine.allows[action].push(oc);
    }

    (ts.getDecorators(node) || []).forEach((d) => {
      if (ts.isPropertyAccessExpression(d.expression)) {
        if (d.expression.expression.getText() !== 'abi') throw Error(`Unknown decorator ${d.getText()}`);
        if (d.expression.name.getText() !== 'readonly') throw Error(`Unknown decorator ${d.getText()}`);
        this.currentSubroutine.readonly = true;
        return;
      }

      const callExpr = d.expression;
      if (!ts.isCallExpression(callExpr)) throw Error(`Unknown decorator ${d.getText()}`);
      const propExpr = callExpr.expression;

      if (!ts.isPropertyAccessExpression(propExpr)) throw Error(`Unknown decorator ${d.getText()}`);
      const decoratorClass = propExpr.expression.getText();
      const decoratorFunction = propExpr.name.getText();

      switch (decoratorClass) {
        case 'abi':
          this.currentSubroutine.readonly = true;
          break;
        case 'allow':
          if (!['call', 'create', 'bareCreate', 'bareCall'].includes(decoratorFunction))
            throw Error(`Unknown decorator ${d.getText()}`);

          if (decoratorFunction.startsWith('bare') && this.currentSubroutine.args.length > 0)
            throw Error('Cannot use bare decorator on method with arguments');

          if (['create', 'bareCreate'].includes(decoratorFunction) && callExpr.arguments.length === 0) {
            if (decoratorFunction.startsWith('bare')) {
              bareAction = true;
              if (this.bareCallConfig.NoOp) throw Error('Duplicate bare decorator for NoOp');
              this.bareCallConfig.NoOp = { action: 'CREATE', method: this.currentSubroutine.name };
            } else this.currentSubroutine.allows.create.push('NoOp');
          } else {
            const arg = callExpr.arguments[0];
            if (arg === undefined) throw Error(`Missing OnComplete in decorator ${d.getText()}`);

            if (!ts.isStringLiteral(arg)) throw Error(`Invalid OnComplete: ${arg.getText()}`);

            const oc = arg.text as
              | 'NoOp'
              | 'OptIn'
              | 'CloseOut'
              | 'ClearState'
              | 'UpdateApplication'
              | 'DeleteApplication';
            if (!ON_COMPLETES.includes(oc)) throw Error(`Invalid OnComplete: ${oc}`);

            if (decoratorFunction.startsWith('bare')) {
              bareAction = true;
              if (this.bareCallConfig[oc]) throw Error(`Duplicate bare decorator for ${oc}`);
              const action = decoratorFunction.replace('bare', '').toUpperCase() as 'CALL' | 'CREATE';

              this.bareCallConfig[oc] = { action, method: this.currentSubroutine.name };
            } else this.currentSubroutine.allows[decoratorFunction as 'call' | 'create'].push(oc);
          }
          break;

        case 'nonABIRouterFallback':
          if (callExpr.arguments[0]) {
            const arg = callExpr.arguments[0];

            if (!ts.isStringLiteral(arg)) throw Error(`Invalid OnComplete: ${arg.getText()}`);

            const oc = arg.text as
              | 'NoOp'
              | 'OptIn'
              | 'CloseOut'
              | 'ClearState'
              | 'UpdateApplication'
              | 'DeleteApplication';
            if (!ON_COMPLETES.includes(oc)) throw Error(`Invalid OnComplete: ${oc}`);

            if (decoratorFunction !== 'call' && decoratorFunction !== 'create')
              throw Error(`Unknown decorator ${d.getText()}`);
            if (this.currentSubroutine.args.length !== 0)
              throw Error('Non-ABI methods must not have arguments defined');
            if (this.currentSubroutine.returns.type !== 'void') throw Error('Non-ABI methods must return void');

            this.currentSubroutine.nonAbi[decoratorFunction as 'call' | 'create'].push(oc);
          } else throw Error(`Missing OnComplete in decorator ${d.getText()}`);

          break;
        default:
          throw Error(`Unknown decorator ${d.getText()}`);
      }
    });

    const { allows, nonAbi } = this.currentSubroutine;
    if (nonAbi.call.length + nonAbi.create.length > 0) {
      if (allows.call.length + allows.create.length > 0) {
        throw Error('Cannot mix @allow and @nonABIRouterFallback decorators');
      }

      this.processSubroutine(node);
      return;
    }

    if (allows.create.length + allows.call.length === 0 && bareAction === false) {
      allows.call.push('NoOp');
    }

    this.processRoutableMethod(node);
  }

  private processClassDeclaration(node: ts.ClassDeclaration) {
    this.classNode = node;

    this.pushLines(node, '#pragma version PROGAM_VERSION');

    if (this.currentProgram === 'lsig') {
      this.pushLines(node, '//#pragma mode logicsig');
    }

    this.pushLines(
      node,
      '',
      `// This TEAL was generated by TEALScript v${VERSION}`,
      '// https://github.com/algorandfoundation/TEALScript',
      ''
    );

    if (this.currentProgram === 'approval') {
      this.pushLines(
        node,
        '// This contract is compliant with and/or implements the following ARCs: [ ARC4 ]',
        '',
        '// The following ten lines of TEAL handle initial program flow',
        '// This pattern is used to make it easy for anyone to parse the start of the program and determine if a specific action is allowed',
        '// Here, action refers to the OnComplete in combination with whether the app is being created or called',
        '// Every possible action for this contract is represented in the switch statement',
        '// If the action is not implmented in the contract, its respective branch will be "NOT_IMPLEMENTED" which just contains "err"',
        'txn ApplicationID',
        'int 0',
        '>',
        'int 6',
        '*',
        'txn OnCompletion',
        '+',
        'switch create_NoOp create_OptIn NOT_IMPLEMENTED NOT_IMPLEMENTED NOT_IMPLEMENTED create_DeleteApplication call_NoOp call_OptIn call_CloseOut NOT_IMPLEMENTED call_UpdateApplication call_DeleteApplication',
        'NOT_IMPLEMENTED:',
        'err'
      );

      this.teal.clear.push({ node, teal: '#pragma version PROGAM_VERSION' });
    } else if (this.currentProgram === 'lsig') {
      this.pushLines(node, '// The address of this logic signature is', '', 'b route_logic');
    }

    node.members.forEach((m) => {
      this.processNode(m);
    });
  }

  private processBlockStatement(node: ts.Block) {
    node.statements.forEach((s) => {
      this.processNode(s);
    });
  }

  private processReturnStatement(node: ts.ReturnStatement) {
    this.addSourceComment(node);

    const returnType = this.currentSubroutine.returns.type;

    if (returnType === 'void') {
      this.pushVoid(node, 'retsub');
      return;
    }

    this.typeHint = returnType;

    this.processNode(node.expression!);

    if (this.lastType.startsWith('unsafe ')) this.checkEncoding(node, this.lastType);
    this.typeComparison(this.lastType, returnType);

    if (this.frameIndex > 0) {
      this.pushLines(node, '// set the subroutine return value', 'frame_bury 0');

      if (this.frameIndex > 1) {
        this.pushLines(node, '// pop all local variables from the stack', `popn ${this.frameIndex - 1}`);
      }
    }
    this.pushVoid(node, 'retsub');

    this.typeHint = undefined;
  }

  private fixBitWidth(node: ts.Node, desiredWidth: number) {
    if (desiredWidth === 64 && this.teal[this.currentProgram].at(-1)!.teal === 'itob') return;

    const lastWidth = parseInt(this.lastType.match(/\d+/)?.[0] || '512', 10);

    if (this.lastType === 'bigint' || this.lastType.startsWith('unsafe')) {
      this.pushLines(
        node,
        `byte 0x${'FF'.repeat(desiredWidth / 8)}`,
        'b&',
        `dup`,
        'len',
        'dup',
        `int ${desiredWidth / 8}`,
        '-',
        'swap',
        'substring3'
      );

      return;
    }

    if (desiredWidth < lastWidth) {
      this.pushLines(node, `extract ${(lastWidth - desiredWidth) / 8} ${desiredWidth / 8}`);

      return;
    }

    this.pushLines(node, `byte 0x${'FF'.repeat(desiredWidth / 8)}`, 'b&');
    this.lastType = `uint${desiredWidth}`;
  }

  private getStackTypeAfterFunction(fn: () => void): string {
    const preType = this.lastType;
    const preTeal = this.teal[this.currentProgram].slice();
    const preLastComment = new Array(...this.lastSourceCommentRange) as [number, number];
    const preTypeHint = this.typeHint;
    fn();
    const type = this.lastType;
    this.lastType = preType;
    this.typeHint = preTypeHint;
    this.teal[this.currentProgram] = preTeal;
    this.lastSourceCommentRange = preLastComment;
    return this.customTypes[type] || type;
  }

  private getStackTypeFromNode(node: ts.Node): string {
    return this.getStackTypeAfterFunction(() => this.processNode(node));
  }

  private typeComparison(inputType: string, expectedType: string): void {
    const abiInputType = this.getABITupleString(inputType);
    const abiExpectedType = this.getABITupleString(expectedType);

    if (abiInputType === abiExpectedType) return;

    const sameTypes = [
      ['address', 'account'],
      ['bytes', 'string', 'byte[]'],
    ];

    let typeEquality = false;

    sameTypes.forEach((t) => {
      if (t.includes(abiInputType) && t.includes(abiExpectedType)) {
        typeEquality = true;
      }
    });

    if (typeEquality) return;

    if (abiInputType !== abiExpectedType) {
      throw Error(`Type mismatch: got ${inputType} expected ${expectedType}`);
    }
  }

  private isBinaryExpression(node: ts.Node): boolean {
    if (ts.isBinaryExpression(node)) {
      return true;
    }

    if (ts.isParenthesizedExpression(node)) {
      return this.isBinaryExpression(node.expression);
    }

    return false;
  }

  mathType = '';

  private processBinaryExpression(node: ts.BinaryExpression) {
    if (node.operatorToken.getText() === '=') {
      this.addSourceComment(node);

      const leftType = this.getStackTypeFromNode(node.left);
      this.typeHint = leftType;

      if (ts.isIdentifier(node.left)) {
        const name = node.left.getText();
        const processedFrame = this.processFrame(node.left, name, false);
        const target = this.localVariables[processedFrame.name];

        this.processNode(node.right);

        const currentArgs = this.currentSubroutine.args;
        if (currentArgs.find((s) => s.name === name && this.isArrayType(s.type))) {
          throw Error(
            'Mutating argument array is not allowed. Create a new variable using the "clone()" method to create a deep copy first.'
          );
        }
        this.pushVoid(node, `frame_bury ${target.index} // ${name}: ${target.type}`);
      } else if (ts.isElementAccessExpression(node.left)) {
        this.processExpressionChain(node.left, node.right);
      } else if (ts.isPropertyAccessExpression(node.left)) {
        const storageName = getStorageName(node.left);

        if (storageName && this.storageProps[storageName]) {
          this.handleStorageAction({
            node: node.left,
            name: storageName,
            action: 'set',
            newValue: node.right,
          });

          return;
        }

        this.processExpressionChain(node.left, node.right);

        // const expressionType = this.getStackTypeFromNode(node.left.expression);
        // const index = Object
        //   .keys(this.getObjectTypes(expressionType)).indexOf(node.left.name.getText());

        // this.processNode(node.left.expression);
        // this.processParentArrayAccess(
        //   node,
        //   [stringToExpression(index.toString())],
        //   node.left.expression,
        //   node.right,
        // );
      }

      // TODO: Type check

      this.typeHint = undefined;
      return;
    }

    let operator = node.operatorToken
      .getText()
      .replace('>>', 'shr')
      .replace('<<', 'shl')
      .replace('===', '==')
      .replace('!==', '!=')
      .replace('**', 'exp');

    let isOperatorAssignment = false;
    if (['+=', '-=', '*=', '/='].includes(operator)) {
      operator = operator.replace('=', '');
      isOperatorAssignment = true;
      this.addSourceComment(node, true);
    }

    if (['&&', '||'].includes(operator)) {
      this.processLogicalExpression(node);
      return;
    }

    const rightType = this.getStackTypeFromNode(node.right);
    const leftType = this.getStackTypeFromNode(node.left);

    const isMathOp = ['+', '-', '*', '/', '%', 'exp'].includes(operator);

    if (ts.isNumericLiteral(node.left)) {
      this.processNumericLiteralWithType(node.left, rightType);
    } else this.processNode(node.left);

    if (this.isSmallNumber(leftType) && isMathOp) this.pushVoid(node, 'btoi');

    if (ts.isNumericLiteral(node.right)) {
      this.processNumericLiteralWithType(node.right, leftType);
    } else this.processNode(node.right);

    if (this.isSmallNumber(leftType) && isMathOp) this.pushVoid(node, 'btoi');

    if (operator === '+' && (leftType === 'string' || leftType === StackType.bytes || leftType.match(/byte\[\d+\]$/))) {
      this.push(node.operatorToken, 'concat', StackType.bytes);
      if (isOperatorAssignment) this.updateValue(node.left);
      return;
    }

    if (operator === 'exp' && leftType !== 'uint64' && !this.isSmallNumber(leftType)) {
      throw new Error(`Exponent operator only supported for uintN <= 64, got ${leftType} and ${rightType}`);
    }

    if (leftType.match(/\d+$/) && !isNumeric(leftType) && (operator === '==' || operator === '!=')) {
      this.push(node, `b${operator}`, 'bool');
    } else if (isMathOp && leftType.match(/\d+$/) && !this.isSmallNumber(leftType) && !isNumeric(leftType)) {
      this.push(node.operatorToken, `b${operator}`, `unsafe ${leftType}`);
    } else {
      this.push(node.operatorToken, operator, leftType);
    }

    if (isMathOp && !isNumeric(leftType)) {
      if (this.isSmallNumber(leftType)) this.pushVoid(node, 'itob');
      this.lastType = `unsafe ${leftType}`;
    }

    if (leftType.match(/ufixed\d+x\d+$/) && isMathOp) {
      const width = parseInt(leftType.match(/\d+/)?.[0] || '512', 10);
      const precision = parseInt(leftType.match(/\d+$/)![0], 10);

      if (width <= 64) {
        this.pushLines(node, 'btoi', `int ${BigInt(10) ** BigInt(precision)}`, '/', 'itob');
      } else {
        this.pushLines(node, `byte 0x${(BigInt(10) ** BigInt(precision)).toString(16)}`, `b/`);
      }
    }

    if (operator === '==' || operator === '!=') {
      this.lastType = 'bool';
    }

    if (isOperatorAssignment) {
      this.updateValue(node.left);
    }

    if (leftType.startsWith('unsafe') || rightType.startsWith('unsafe')) {
      this.typeComparison(leftType.replace('unsafe ', ''), rightType.replace('unsafe ', ''));
      this.lastType = `unsafe ${leftType.replace(/unsafe /g, '')}`;
    } else if (!ts.isNumericLiteral(node.left) && !ts.isNumericLiteral(node.right))
      this.typeComparison(leftType, rightType);
  }

  private processLogicalExpression(node: ts.BinaryExpression) {
    this.processNode(node.left);

    let label: string;

    if (node.operatorToken.getText() === '&&') {
      label = `skip_and${this.andCount}`;
      this.andCount += 1;

      this.pushVoid(node.operatorToken, 'dup');
      this.pushVoid(node.operatorToken, `bz ${label}`);
    } else if (node.operatorToken.getText() === '||') {
      label = `skip_or${this.orCount}`;
      this.orCount += 1;

      this.pushVoid(node.operatorToken, 'dup');
      this.pushVoid(node.operatorToken, `bnz ${label}`);
    }

    this.processNode(node.right);
    this.push(node.operatorToken, node.operatorToken.getText(), StackType.uint64);
    this.pushVoid(node.operatorToken, `${label!}:`);
  }

  private processIdentifier(node: ts.Identifier) {
    // should only be true when calling getStackTypeFromNode
    if (node.getText() === 'globals') {
      this.lastType = 'globals';
      return;
    }

    if (this.constants[node.getText()]) {
      this.processNode(this.constants[node.getText()]);
      return;
    }

    const processedFrame = this.processFrame(node, node.getText(), true);

    if (processedFrame.accessors.length > 0) {
      this.processParentArrayAccess(node, processedFrame.accessors, node);
    }
  }

  private processNewExpression(node: ts.NewExpression) {
    (node.arguments || []).forEach((a) => {
      this.processNode(a);
    });

    this.lastType = this.getABIType(node.expression.getText());
  }

  private fixByteWidth(node: ts.Node, desiredWidth: number) {
    const lastType = this.getABIType(this.lastType);

    if (lastType === 'string' || lastType === 'byte[]' || lastType === 'bytes') {
      this.pushLines(
        node,
        `byte 0x${'00'.repeat(desiredWidth)}`,
        'concat',
        'dup',
        `extract ${desiredWidth} 0`,
        'byte 0x',
        'b==',
        'assert',
        `extract 0 ${desiredWidth}`
      );
      return;
    }

    const lastWidth = parseInt(lastType.match(/\d+/)![0], 10);

    if (lastWidth > desiredWidth) {
      this.pushLines(node, `extract 0 ${desiredWidth}`);
    } else if (lastWidth < desiredWidth) {
      this.pushLines(node, `byte 0x${'00'.repeat(desiredWidth - lastWidth)}`, 'concat');
    }
  }

  private processTypeCast(node: ts.AsExpression | ts.TypeAssertion) {
    if (ts.isNumericLiteral(node.expression)) {
      this.processNumericLiteralWithType(node.expression, this.getABIType(node.type.getText()));
      return;
    }

    this.typeHint = this.getABIType(node.type.getText());
    const type = this.getABIType(node.type.getText());

    if (ts.isStringLiteral(node.expression)) {
      const width = parseInt(type.match(/\d+/)![0], 10);
      const str = node.expression.text;
      if (str.length > width) throw new Error(`String literal too long for ${type}`);
      const padBytes = width - str.length;
      const hex = Buffer.from(str).toString('hex');
      const paddedHex = hex + '00'.repeat(padBytes);
      this.push(node, `byte 0x${paddedHex} // "${str}"`, type);
      return;
    }

    this.processNode(node.expression);

    if (type.match(/byte\[\d+\]$/)) {
      const typeWidth = parseInt(type.match(/\d+/)![0], 10);
      this.fixByteWidth(node, typeWidth);
    }

    if (this.lastType === 'any') {
      this.lastType = node.type.getText();
      return;
    }

    if ((type.match(/uint\d+$/) || type.match(/ufixed\d+x\d+$/)) && type !== this.lastType) {
      const typeBitWidth = parseInt(type.match(/\d+/)![0], 10);

      if (this.lastType === 'uint64') this.pushVoid(node, 'itob');
      this.overflowCheck(node, typeBitWidth);
      this.fixBitWidth(node, typeBitWidth);

      if (type === StackType.uint64) {
        this.push(node, 'btoi', StackType.uint64);
      }
    }

    this.typeHint = undefined;
    this.lastType = type;
  }

  private processVariableDeclaration(node: ts.VariableDeclarationList) {
    node.declarations.forEach((d) => {
      this.typeHint = d.type?.getText();
      this.processNode(d);
      this.typeHint = undefined;
    });
  }

  /**
   * Saves information about storage access such as the key (and account if local storage) to the frame
   *
   * @param node The node that is saving storage access in a variable
   * @param name The name of the new variable
   * @param storageExpression The expression for accessing the storage property
   * @param type The value type
   * @param accessors If accessing an array, save the accessors used (ie. if `this.myArrays('foo').value[0][1]` then save [0, 1])
   */
  private initializeStorageFrame(
    node: ts.Node,
    name: string,
    storageExpression: ts.PropertyAccessExpression,
    type: string,
    accessors?: (string | ts.Expression)[]
  ) {
    this.localVariables[name] = {
      accessors,
      storageExpression,
      type,
    };

    // Get information about the storage access and ensure there are keys we need to save
    const storageName = getStorageName(storageExpression)!;
    const storageProp = this.storageProps[storageName];
    if (!ts.isCallExpression(storageExpression.expression)) throw Error();

    // Save the key to the frame. For local storage this will be the second argument, for global and box storage it will be the first argument
    const argLength = storageExpression.expression.arguments.length;
    const keyNode = storageExpression.expression.arguments[argLength === 2 ? 1 : 0];

    // If the storage object has a key (any GlobalStateMap, LocalStateMap, and BoxMap)
    if (keyNode !== undefined && !ts.isLiteralExpression(keyNode)) {
      this.addSourceComment(node, true);

      // Add the prefix to the given key if it exists
      if (storageProp.prefix) {
        const hex = Buffer.from(storageProp.prefix).toString('hex');
        this.pushVoid(keyNode, `byte 0x${hex} // "${storageProp.prefix}"`);
      }

      this.processNode(keyNode);

      // Ensure the key is properly encoded (except for bytes which are not ABI encoded)
      if (storageProp.keyType !== StackType.bytes) {
        this.checkEncoding(keyNode, this.lastType);
      }

      if (storageProp.prefix) this.pushVoid(keyNode, 'concat');

      const keyFrameName = `storage key//${name}`;

      // Save the map key to the frame
      this.pushVoid(keyNode, `frame_bury ${this.frameIndex} // ${keyFrameName}`);
      this.localVariables[keyFrameName] = {
        index: this.frameIndex,
        type: StackType.uint64,
      };
      this.frameIndex += 1;

      // Save the name of the storage key frame in the variable frame object
      this.localVariables[name].storageKeyFrame = keyFrameName;
    }

    // If we are saving access for local storage, we need to save the account to the frame as well
    if (storageProp.type === 'local') {
      const accountNode = storageExpression.expression.arguments[0];
      const accountFrameName = `storage account//${name}`;

      this.addSourceComment(node, true);

      // Save the account in the frame
      this.processNode(accountNode);
      this.pushVoid(accountNode, `frame_bury ${this.frameIndex} // ${accountFrameName}`);
      this.localVariables[accountFrameName] = {
        index: this.frameIndex,
        type: StackType.uint64,
      };
      this.frameIndex += 1;

      // Save the name of the storage frame in the variable frame object
      this.localVariables[name].storageAccountFrame = accountFrameName;
    }
  }

  private processVariableDeclarator(node: ts.VariableDeclaration) {
    const name = node.name.getText();

    if (node.initializer) {
      let initializerType = this.getStackTypeFromNode(node.initializer);

      if (!this.customTypes[initializerType]) initializerType = this.getABIType(initializerType);

      let lastFrameAccess: string | undefined;

      const isArray = initializerType.endsWith(']') || initializerType.endsWith('}');

      if (ts.isIdentifier(node.initializer) && !this.constants[node.initializer.getText()] && isArray) {
        lastFrameAccess = node.initializer.getText();

        this.localVariables[name] = {
          framePointer: lastFrameAccess,
          type: initializerType,
        };

        return;
      }

      if (ts.isElementAccessExpression(node.initializer) && isArray) {
        const accessChain = this.getAccessChain(node.initializer);
        lastFrameAccess = accessChain[0].expression.getText();

        const type = this.getStackTypeFromNode(accessChain[0].expression);

        if (type.endsWith(']') || type.endsWith('}')) {
          // Only add source comments if there will be generated TEAL
          if (accessChain.find((e) => ts.isNumericLiteral(e.argumentExpression))) {
            this.addSourceComment(node);
          }
          const accessors = accessChain.map((e, i) => {
            if (ts.isNumericLiteral(e.argumentExpression)) return e.argumentExpression;

            if (ts.isNumericLiteral(e.argumentExpression)) {
              this.push(e.argumentExpression, `int ${e.argumentExpression.getText()}`, StackType.uint64);
            } else this.processNode(e.argumentExpression);

            const accName = `accessor//${i}//${name}`;
            this.pushVoid(node.initializer!, `frame_bury ${this.frameIndex} // accessor: ${accName}`);

            this.localVariables[accName] = {
              index: this.frameIndex,
              type: StackType.uint64,
            };

            this.frameIndex += 1;

            return accName;
          });

          if (lastFrameAccess.startsWith('this.')) {
            if (!ts.isPropertyAccessExpression(accessChain[0].expression)) throw new Error('Expected call expression');
            this.initializeStorageFrame(node, name, accessChain[0].expression, initializerType, accessors);
          } else {
            this.localVariables[name] = {
              accessors,
              framePointer: lastFrameAccess,
              type: initializerType,
            };
          }

          if (node.type) this.typeComparison(this.lastType, node.type.getText());
          return;
        }
      }

      if (
        ts.isPropertyAccessExpression(node.initializer) &&
        getStorageName(node.initializer) &&
        this.storageProps[getStorageName(node.initializer)!] &&
        isArray
      ) {
        this.initializeStorageFrame(node, name, node.initializer, initializerType);

        if (node.type) this.typeComparison(this.lastType, node.type.getText());
        return;
      }

      if (ts.isPropertyAccessExpression(node.initializer) && isArray) {
        lastFrameAccess = node.initializer.expression.getText();

        const type = this.getStackTypeFromNode(node.initializer.expression);
        if (type.endsWith(']') || type.endsWith('}')) {
          const index = Object.keys(this.getObjectTypes(type)).indexOf(node.initializer.name.getText());

          if (lastFrameAccess.startsWith('this.')) {
            if (!ts.isPropertyAccessExpression(node.initializer.expression))
              throw new Error('Expected call expression');

            this.initializeStorageFrame(node, name, node.initializer.expression, initializerType, [
              stringToExpression(index.toString()) as ts.Expression,
            ]);
          } else {
            this.localVariables[name] = {
              accessors: [stringToExpression(index.toString()) as ts.Expression],
              framePointer: lastFrameAccess,
              type: initializerType,
            };
          }

          if (node.type) this.typeComparison(initializerType, node.type.getText());
          return;
        }
      }

      this.addSourceComment(node);
      const hint = node.type?.getText();

      if (ts.isNumericLiteral(node.initializer) && this.typeHint) {
        this.processNumericLiteralWithType(node.initializer, this.getABIType(this.typeHint));
      } else {
        this.typeHint = hint;
        this.processNode(node.initializer);
        if (node.type) this.typeComparison(this.lastType, node.type.getText());
      }

      const type = hint && this.customTypes[hint] ? hint : this.getABIType(this.lastType);

      this.localVariables[name] = {
        index: this.frameIndex,
        type,
      };

      this.pushVoid(node, `frame_bury ${this.frameIndex} // ${name}: ${type}`);

      this.frameIndex += 1;
    } else {
      if (!node.type) throw new Error('Uninitialized variables must have a type');

      this.localVariables[name] = {
        index: this.frameIndex,
        type: this.getABIType(node.type.getText()),
      };

      this.frameIndex += 1;
    }
  }

  private processExpressionStatement(node: ts.ExpressionStatement) {
    this.processNode(node.expression);
  }

  private isDynamicArrayOfStaticType(type: string) {
    const baseType = type.replace(/\[\]$/, '');

    return ['string', 'bytes'].includes(type) || (type.endsWith('[]') && !this.isDynamicType(baseType));
  }

  private processIfStatement(node: ts.IfStatement, elseIfCount: number = 0) {
    let labelPrefix: string;

    if (elseIfCount === 0) this.ifCount += 1;
    const { ifCount } = this;

    if (elseIfCount === 0) {
      labelPrefix = `if${ifCount}`;
      this.pushVoid(node, `// ${labelPrefix}_condition`);
    } else {
      labelPrefix = `if${ifCount}_elseif${elseIfCount}`;
      this.pushVoid(node, `${labelPrefix}_condition:`);
    }

    this.addSourceComment(node.expression);
    this.processNode(node.expression);

    if (node.elseStatement == null) {
      this.pushVoid(node, `bz if${ifCount}_end`);
      this.pushVoid(node, `// ${labelPrefix}_consequent`);
      this.processNode(node.thenStatement);
    } else if (ts.isIfStatement(node.elseStatement)) {
      this.pushVoid(node, `bz if${ifCount}_elseif${elseIfCount + 1}_condition`);
      this.pushVoid(node, `// ${labelPrefix}_consequent`);
      this.processNode(node.thenStatement);
      this.pushVoid(node, `b if${ifCount}_end`);
      this.processIfStatement(node.elseStatement, elseIfCount + 1);
    } else {
      this.pushVoid(node, `bz if${ifCount}_else`);
      this.pushVoid(node, `// ${labelPrefix}_consequent`);
      this.processNode(node.thenStatement);
      this.pushVoid(node, `b if${ifCount}_end`);
      this.pushVoid(node, `if${ifCount}_else:`);
      this.processNode(node.elseStatement);
    }

    if (elseIfCount === 0) {
      this.pushVoid(node, `if${ifCount}_end:`);
    }
  }

  private processUnaryExpression(node: ts.PrefixUnaryExpression) {
    this.processNode(node.operand);
    switch (node.operator) {
      case 53:
        this.pushVoid(node.operand, '!');
        break;
      default:
        throw new Error(`Unsupported unary operator ${node.operator}`);
    }
  }

  private processPropertyDefinition(node: ts.PropertyDeclaration) {
    if (node.initializer === undefined) throw Error();

    if (node.name.getText() === 'programVersion') {
      if (!ts.isNumericLiteral(node.initializer)) throw Error('programVersion must be a number');

      this.programVersion = parseInt(node.initializer.text, 10);

      if (this.programVersion < 8) throw Error('programVersion must be >= 8');
      return;
    }

    if (
      ts.isCallExpression(node.initializer) &&
      ['BoxMap', 'GlobalStateMap', 'LocalStateMap', 'BoxKey', 'GlobalStateKey', 'LocalStateKey'].includes(
        node.initializer.expression.getText()
      )
    ) {
      if (this.currentProgram === 'lsig') {
        throw Error('Logic signatures cannot have stateful properties');
      }

      let props: StorageProp;
      const klass = node.initializer.expression.getText();
      const type = klass.toLocaleLowerCase().replace('state', '').replace('map', '').replace('key', '') as StorageType;
      const typeArgs = node.initializer.typeArguments;

      if (typeArgs === undefined) {
        throw new Error('Type arguments must be specified for storage properties');
      }

      if (klass.includes('Map')) {
        if (typeArgs.length !== 2) throw new Error(`Expected 2 type arguments for ${klass}`);
        props = {
          type,
          keyType: this.getABIType(typeArgs[0].getText()),
          valueType: this.getABIType(typeArgs[1].getText()),
        };
      } else {
        if (typeArgs.length !== 1) throw new Error(`Expected a type argument for ${klass}`);

        props = {
          type,
          keyType: 'bytes',
          valueType: this.getABIType(typeArgs[0].getText()),
        };
      }

      if (props.type === 'box' && this.isDynamicType(props.valueType)) {
        props.dynamicSize = true;
      }

      if (node.initializer?.arguments?.[0] !== undefined) {
        if (!ts.isObjectLiteralExpression(node.initializer.arguments[0])) throw new Error('Expected object literal');

        node.initializer.arguments[0].properties.forEach((p) => {
          if (!ts.isPropertyAssignment(p)) throw new Error();
          const name = p.name?.getText();

          switch (name) {
            case 'key':
              if (klass.includes('Map')) throw new Error(`${name} only applies to storage keys`);
              if (!ts.isStringLiteral(p.initializer)) throw new Error('Storage key must be string');
              props.key = p.initializer.text;
              break;
            case 'dynamicSize':
              if (props.type !== 'box') throw new Error(`${name} only applies to box storage`);
              if (!this.isDynamicType(props.valueType)) throw new Error(`${name} only applies to dynamic types`);

              props.dynamicSize = p.initializer.getText() === 'true';
              break;
            case 'prefix':
              if (!klass.includes('Map')) throw new Error(`${name} only applies to storage maps`);
              if (!ts.isStringLiteral(p.initializer)) throw new Error('Storage prefix must be string');
              props.prefix = p.initializer.text;
              break;
            case 'maxKeys':
              if (!klass.includes('Map')) throw new Error(`${name} only applies to storage maps`);
              if (!ts.isNumericLiteral(p.initializer)) throw new Error('Storage maxKeys must be number');
              props.maxKeys = parseInt(p.initializer.text, 10);
              break;
            case 'allowPotentialCollisions':
              if (
                p.initializer.kind !== ts.SyntaxKind.TrueKeyword &&
                p.initializer.kind !== ts.SyntaxKind.FalseKeyword
              ) {
                throw new Error('Storage allowPotentialCollisions must be boolean');
              }
              props.allowPotentialCollisions = p.initializer.kind === ts.SyntaxKind.TrueKeyword;
              break;
            default:
              throw new Error(`Unknown property ${name}`);
          }
        });
      }

      if (!props.key && klass.includes('Key')) {
        props.key = node.name.getText();
      }

      if (klass.includes('StateMap') && !props.maxKeys) throw new Error('maxKeys must be specified for state maps');

      if (klass.includes('Map') && props.allowPotentialCollisions !== true) {
        const prefixRequired = Object.keys(this.storageProps).find((propName) => {
          const p = this.storageProps[propName];
          return (
            p.type === type &&
            (this.isDynamicType(p.keyType) || this.getTypeLength(p.keyType) === this.getTypeLength(props.keyType))
          );
        });

        if (prefixRequired) {
          if (props.prefix === undefined)
            throw Error(
              `Prefix must be defined for "${node.name.getText()}" due to potential collision with "${prefixRequired}"`
            );

          const collision = Object.keys(this.storageProps).find((propName) => {
            const p = this.storageProps[propName];
            return p.type === type && (p.key?.startsWith(props.prefix!) || p.prefix === props.prefix);
          });

          if (collision) {
            throw Error(`Storage prefix "${props.prefix}" collides with existing storage property "${collision}"`);
          }
        }
      } else if (props.allowPotentialCollisions !== true) {
        const prefixRequired = Object.keys(this.storageProps).find((propName) => {
          const p = this.storageProps[propName];
          return (
            p.type === type &&
            p.key === undefined &&
            p.prefix === undefined &&
            (this.isDynamicType(p.keyType) || this.getTypeLength(p.keyType) === this.getTypeLength(props.keyType))
          );
        });

        if (prefixRequired) {
          throw Error(
            `"${node.name.getText()}" has a potential key collision with "${prefixRequired}". "${prefixRequired}" must have a prefix or "${node.name.getText()}" must have a different key name`
          );
        }

        const thisKey = props.key || node.name.getText();
        const collision = Object.keys(this.storageProps).find((propName) => {
          const p = this.storageProps[propName];

          return (
            p.type === type && (propName === thisKey || p.key === thisKey || (p.prefix && thisKey.startsWith(p.prefix)))
          );
        });

        if (collision) {
          throw Error(
            `Storage key for "${node.name.getText()}" collides with existing storage property "${collision}". One of the names or prefixes must be changed`
          );
        }
      }

      this.storageProps[node.name.getText()] = props;
    } else if (ts.isNewExpression(node.initializer) && node.initializer.expression.getText() === 'EventLogger') {
      if (this.currentProgram === 'lsig') {
        throw Error('Logic signatures cannot log events');
      }

      if (!ts.isTupleTypeNode(node.initializer.typeArguments![0]))
        throw Error('EventLogger type argument must be a tuple of types');

      this.events[node.name.getText()] =
        node.initializer.typeArguments![0]!.elements.map((t) => t.getText().replace(/bytes/g, 'byte[]')) || [];
    } else if (ts.isCallExpression(node.initializer) && node.initializer.expression.getText() === 'ScratchSlot') {
      if (node.initializer.typeArguments?.length !== 1) throw Error('ScratchSlot must have one type argument ');

      if (node.initializer.arguments?.length !== 1) throw Error('ScratchSlot must have one argument');

      if (!ts.isNumericLiteral(node.initializer.arguments[0]))
        throw Error('ScratchSlot argument must be a literal number');

      const type = node.initializer.typeArguments[0].getText();
      const name = node.name.getText();
      const slot = parseInt(node.initializer.arguments[0].getText(), 10);

      if (slot < 0 || slot > 200)
        throw Error('Scratch slot must be between 0 and 200 (inclusive). 201-256 is reserved for the compiler');

      this.scratch[name] = { type, slot };
    } else if (ts.isCallExpression(node.initializer) && node.initializer.expression.getText() === 'TemplateVar') {
      if (node.initializer.typeArguments?.length !== 1) throw Error('TemplateVar must have one type argument ');

      if (node.initializer.arguments[0] && !ts.isNumericLiteral(node.initializer.arguments[0])) {
        throw Error('TemplateVar name argument must be a string literal');
      }

      const name = node.initializer.arguments[0]?.getText() || node.name.getText();

      this.templateVars[node.name.getText()] = {
        type: node.initializer.typeArguments[0].getText(),
        name,
      };
    } else {
      throw new Error();
    }
  }

  private processNumericLiteralWithType(node: ts.NumericLiteral, type: string) {
    if (type === 'uint64') {
      this.processNode(node);
      return;
    }

    if (type === 'bigint') {
      const value = Number(node.getText());
      let hex = value.toString(16);
      if (hex.length % 2) hex = `0${hex}`;
      this.push(node, `byte 0x${hex}`, type);
      return;
    }

    if (type.match(/ufixed\d+x\d+$/)) {
      const match = type.match(/\d+/g)!;
      const n = parseInt(match[0], 10);
      const m = parseInt(match[1], 10);

      const numDecimals = node.getText().match(/(?<=\.)\d+/)![0].length;

      if (numDecimals > m)
        throw Error(`Value ${node.getText()} cannot be represented as ${type}. A more precise type is required.`);

      const valueStr = node.getText().replace('.', '') + '0'.repeat(m - numDecimals);

      const fixedValue = BigInt(valueStr);

      this.push(node, `byte 0x${fixedValue.toString(16).padStart(n / 4, '00')}`, type);

      return;
    }

    if (type.match(/uint\d+$/)) {
      const width = Number(type.match(/\d+/)![0]);
      const value = Number(node.getText());
      const maxValue = 2 ** width - 1;

      if (value > maxValue) {
        throw Error(`Value ${value} is too large for ${type}. Max value is ${maxValue}`);
      }

      this.push(node, `byte 0x${value.toString(16).padStart(width / 4, '0')}`, type);
    }
  }

  private processLiteral(node: ts.StringLiteral | ts.NumericLiteral) {
    if (node.kind === ts.SyntaxKind.StringLiteral) {
      const hex = Buffer.from(node.text, 'utf8').toString('hex');
      this.push(node, `byte 0x${hex} // "${node.text}"`, StackType.bytes);
    } else {
      this.push(node, `int ${node.getText()}`, StackType.uint64);
    }
  }

  /**
   * Method for handling an expression chain that starts with `this`
   *
   * Note this method will delete elements from the chain as they are processed
   *
   * @param chain Expression chain to process
   * @param newValue New value to assign to the chain expression
   */
  private processThisBase(chain: ExpressionChainNode[], newValue?: ts.Node) {
    // If this is a pendingGroup call (ie. `this.pendingGroup.submit()`)
    if (chain[0] && ts.isPropertyAccessExpression(chain[0]) && chain[0].name.getText() === 'pendingGroup') {
      if (!ts.isPropertyAccessExpression(chain[1]))
        throw Error(`Unsupported ${ts.SyntaxKind[chain[1].kind]} ${chain[1].getText()}`);
      if (!ts.isCallExpression(chain[2]))
        throw Error(`Unsupported ${ts.SyntaxKind[chain[2].kind]} ${chain[2].getText()}`);

      const methodName = chain[1].name.getText();
      if (chain[2].arguments[0]) {
        this.processTransaction(chain[2], methodName, chain[2].arguments[0], chain[2].typeArguments);
      } else if (methodName === 'submit') {
        this.pushVoid(chain[2], 'itxn_submit');
      } else throw new Error(`Unknown method ${chain[2].getText()}`);

      chain.splice(0, 3);
      return;
    }

    // If accessing the txnGroup
    if (chain[0] && ts.isPropertyAccessExpression(chain[0]) && chain[0].name.getText() === 'txnGroup') {
      // If getting the group size
      if (chain[1] && ts.isPropertyAccessExpression(chain[1]) && chain[1].name.getText() === 'length') {
        this.push(chain[1], 'global GroupSize', StackType.uint64);
        chain.splice(0, 2);
        return;
      }

      // Otherwise this should be a group index
      if (!ts.isElementAccessExpression(chain[1]))
        throw Error(`Unsupported ${ts.SyntaxKind[chain[1].kind]} ${chain[1].getText()}`);
      this.processNode(chain[1].argumentExpression);
      this.lastType = 'txn';

      chain.splice(0, 2);
      return;
    }

    // If this is a template variable
    if (ts.isPropertyAccessExpression(chain[0]) && this.templateVars[chain[0].name.getText()]) {
      const { type, name } = this.templateVars[chain[0].name.getText()];
      if (isNumeric(type)) {
        this.push(chain[0], `pushint TMPL_${name}`, type);
      } else {
        this.push(chain[0], `pushbytes TMPL_${name}`, type);
      }

      chain.splice(0, 1);
      return;
    }

    // If this is a scratch slot
    if (ts.isPropertyAccessExpression(chain[0]) && this.scratch[chain[0].name.getText()]) {
      if (!ts.isPropertyAccessExpression(chain[1])) throw Error(`Invalid scratch expression ${chain[1].getText()}`);
      if (chain[1].name.getText() !== 'value') throw Error(`Invalid scratch expression ${chain[1].getText()}`);

      const name = chain[0].name.getText();

      if (newValue !== undefined) {
        this.processNode(newValue);
        this.typeComparison(this.lastType, this.scratch[name].type);
        this.push(chain[1], `store ${this.scratch[name].slot}`, this.scratch[name].type);
      } else {
        this.push(chain[1], `load ${this.scratch[name].slot}`, this.scratch[name].type);
      }

      chain.splice(0, 2);
      return;
    }

    // If this is an event
    if (ts.isPropertyAccessExpression(chain[0]) && this.events[chain[0].name.getText()]) {
      const name = chain[0].name.getText();
      const types = this.events[name];

      if (!ts.isPropertyAccessExpression(chain[1]) || !ts.isCallExpression(chain[2]))
        throw Error(`Unsupported ${ts.SyntaxKind[chain[1].kind]} ${chain[1].getText()}`);

      if (chain[1].name.getText() !== 'log') throw Error(`Unsupported event method ${chain[1].name.getText()}`);

      const argTypes = this.getABITupleString(types.map((t) => this.getABIType(t)).join(','))
        .replace(/account/g, 'address')
        .replace(/(application|asset)/g, 'uint64');

      const signature = `${name}(${argTypes})`;

      const selector = sha512_256(Buffer.from(signature)).slice(0, 8);

      this.typeHint = `[${types.map((t) => this.getABIType(t)).join(',')}]`;
      this.pushVoid(chain[2], `byte 0x${selector} // ${signature}`);
      this.processArrayElements(chain[2].arguments, chain[2]);
      this.pushVoid(chain[2], 'concat');

      this.pushVoid(chain[2], 'log');

      chain.splice(0, 3);
      return;
    }

    // If this is a storage property (ie. GlobalMap, BoxKey, etc.)
    if (ts.isPropertyAccessExpression(chain[0]) && this.storageProps[chain[0].name.getText()]) {
      const name = chain[0].name.getText();
      const storageProp = this.storageProps[name];

      /**
       * Specifies whether this is a storage Map or LocalState, which means it's
       * always a call expression.
       */
      const isMapOrLocal = storageProp.key === undefined || storageProp.type === 'local';

      /** The index of the node that specifies which action to take. ie `.value` or `.delete()` */
      let actionNodeIndex = isMapOrLocal ? 2 : 1;

      if (chain[actionNodeIndex + 1] && ts.isCallExpression(chain[actionNodeIndex + 1])) {
        actionNodeIndex += 1;
      }

      const actionNode = chain[actionNodeIndex] as ts.CallExpression | ts.PropertyAccessExpression;

      /** name of the action. ie "value" or "delete" */
      let action: string;

      if (ts.isPropertyAccessExpression(actionNode)) action = actionNode.name.getText();
      if (ts.isCallExpression(actionNode)) {
        action = (actionNode.expression as ts.PropertyAccessExpression).name.getText();
      }

      // Don't get the box value if we can use box_replace later when updating the array
      if (!(newValue !== undefined && storageProp.type === 'box' && !this.isDynamicType(storageProp.valueType))) {
        this.handleStorageAction({
          node: actionNode,
          name,
          action: action!.replace('value', 'get') as
            | 'get'
            | 'set'
            | 'exists'
            | 'delete'
            | 'create'
            | 'extract'
            | 'replace'
            | 'size',
        });
      } else this.lastType = storageProp.valueType;

      chain.splice(0, actionNodeIndex + 1);
      return;
    }

    // If `this.txn`, `this.app`, or `this.itxn`
    if (ts.isPropertyAccessExpression(chain[0]) && ['txn', 'app', 'itxn'].includes(chain[0].name.getText())) {
      const op = chain[0].name.getText();

      // If the entire expression is simply `this.txn` which returns the current txn
      if (op === 'txn' && chain[1] === undefined) {
        this.push(chain[0], 'txn', 'txn');
        chain.splice(0, 1);
        return;
      }

      // If the entire expression is simply `this.app` which returns the current app
      if (op === 'app' && chain[1] === undefined) {
        this.push(chain[0], 'txna Applications 0', ForeignType.Application);
        chain.splice(0, 1);
        return;
      }

      // If the expression is an app argument
      if (op === 'app') {
        // If the expression is `this.app.address`, then use `CurrentApplicationAddress` rather
        // than app_params_get (which would be handled later by processOpcodeImmediate if we didn't
        // return here)
        if (ts.isPropertyAccessExpression(chain[1]) && chain[1].name.getText() === 'address') {
          this.push(chain[1], 'global CurrentApplicationAddress', 'address');
          chain.splice(0, 2);
          return;
        }
        this.push(chain[0], 'txna Applications 0', ForeignType.Application);
        chain.splice(0, 1);
        return;
      }

      // Assume this is an param opcode (ie. `this.txn.sender` or `this.app.creator`)
      if (!ts.isPropertyAccessExpression(chain[1]))
        throw Error(`Unsupported ${ts.SyntaxKind[chain[1].kind]} ${chain[1].getText()}`);
      this.processOpcodeImmediate(chain[0], chain[0].name.getText(), chain[1].name.getText(), false, true);

      chain.splice(0, 2);
      return;
    }

    if (ts.isPropertyAccessExpression(chain[0]) && ts.isCallExpression(chain[1])) {
      const methodName = chain[0].name.getText();
      const preArgsType = this.lastType;
      const subroutine = this.subroutines.find((s) => s.name === methodName);
      if (!subroutine) throw new Error(`Unknown subroutine ${methodName}`);

      new Array(...chain[1].arguments).reverse().forEach((a) => {
        this.processNode(a);
      });

      this.lastType = preArgsType;
      this.push(chain[1], `callsub ${methodName}`, subroutine.returns.type);
      chain.splice(0, 2);
    }
  }

  /**
   * Walks an expression chain and processes each node
   * @param node The node to process
   * @param newValue If we are setting the value of an array, the new value will be passed here
   */
  private processExpressionChain(node: ExpressionChainNode, newValue?: ts.Node) {
    const { base, chain } = this.getExpressionChain(node);

    if (ts.isParenthesizedExpression(base)) {
      if (!ts.isBinaryExpression(base.expression))
        throw Error(`Unexpected parentheses around ${ts.SyntaxKind[base.expression.kind]}`);
      this.processNode(base.expression);
    }

    this.addSourceComment(node);
    let storageBase: ts.PropertyAccessExpression | undefined;

    if (base.kind === ts.SyntaxKind.ThisKeyword) {
      // If the chain starts with a storage expression, then we need to handle it differently
      // than just an identifer when it comes to updating array values, so save it seperately here
      if (
        ts.isPropertyAccessExpression(chain[0]) &&
        chain[1] &&
        (ts.isPropertyAccessExpression(chain[1]) || ts.isCallExpression(chain[1])) &&
        this.storageProps[chain[0].name.getText()]
      ) {
        storageBase = (ts.isCallExpression(chain[1]) ? chain[2] : chain[1]) as ts.PropertyAccessExpression;
      }
      this.processThisBase(chain, newValue);
    }

    /**
     * An array of objects used to access the base array.
     * For example, `myObj.foo[2]` -> `["myObj", ts.Node(2)]`
     * */
    const accessors: (string | ts.Expression)[] = [];

    if (ts.isIdentifier(base)) {
      if (base.getText() === 'OnCompletion') {
        if (ts.isPropertyAccessExpression(chain[0])) {
          const oc = chain[0].name.getText() as OnComplete;

          this.pushVoid(chain[0], `int ${ON_COMPLETES.indexOf(oc)} // ${oc}`);

          chain.splice(0, 1);
        }
      }

      if (this.contractClasses.includes(base.getText())) {
        if (ts.isPropertyAccessExpression(chain[0])) {
          const propName = chain[0].name.getText();

          switch (propName) {
            case 'approvalProgram':
              if (!ts.isCallExpression(chain[1])) throw Error(`approvralProgram must be a function call`);
              this.push(chain[1], `PENDING_COMPILE_APPROVAL: ${base.getText()}`, 'bytes');
              chain.splice(0, 2);
              break;
            case 'clearProgram':
              if (!ts.isCallExpression(chain[1])) throw Error(`clearProgram must be a function call`);
              this.push(chain[1], `PENDING_COMPILE_CLEAR: ${base.getText()}`, 'bytes');
              chain.splice(0, 2);
              break;
            case 'schema':
              if (!ts.isPropertyAccessExpression(chain[1])) throw Error();
              if (!ts.isPropertyAccessExpression(chain[2])) throw Error();

              // eslint-disable-next-line no-case-declarations
              const globalOrLocal = chain[1].name.getText() === 'global' ? 'GLOBAL' : 'LOCAL';
              // eslint-disable-next-line no-case-declarations
              const uintOrBytes = chain[2].name.getText() === 'uint' ? 'INT' : 'BYTES';
              this.push(chain[1], `PENDING_SCHEMA_${globalOrLocal}_${uintOrBytes}: ${base.getText()}`, 'uint64');
              chain.splice(0, 3);

              break;
            default:
              throw Error(`Unknown contract property ${propName}`);
          }
        }
      }

      if (this.lsigClasses.includes(base.getText())) {
        if (ts.isPropertyAccessExpression(chain[0])) {
          const propName = chain[0].name.getText();

          switch (propName) {
            case 'program':
              if (!ts.isCallExpression(chain[1])) throw Error(`program must be a function call`);
              this.push(chain[1], `PENDING_COMPILE_LSIG: ${base.getText()}`, 'bytes');
              chain.splice(0, 2);
              break;
            case 'address':
              if (!ts.isCallExpression(chain[1])) throw Error(`address must be a function call`);
              this.push(chain[1], `PENDING_COMPILE_LSIG_ADDR: ${base.getText()}`, 'bytes');
              chain.splice(0, 2);
              break;
            default:
              throw Error(`Unknown lsig property ${propName}`);
          }
        }
      }

      // If this is a constant
      if (this.constants[base.getText()]) {
        this.processNode(this.constants[base.getText()]);
      }

      // If getting a txn type via the TransactionType enum
      if (base.getText() === 'TransactionType') {
        const enums: { [key: string]: string } = {
          Unknown: 'unknown',
          Payment: 'pay',
          KeyRegistration: 'keyreg',
          AssetConfig: 'acfg',
          AssetTransfer: 'axfer',
          AssetFreeze: 'afrz',
          ApplicationCall: 'appl',
        };

        if (!ts.isPropertyAccessExpression(chain[0]))
          throw Error(`Unsupported ${ts.SyntaxKind[chain[0].kind]} ${chain[0].getText()}`);
        const txType = chain[0].name.getText();

        if (!enums[txType]) throw new Error(`Unknown transaction type ${txType}`);
        this.push(node, `int ${enums[txType]}`, StackType.uint64);
        return;
      }

      // If a txn method like sendMethodCall, sendPayment, etc.
      if (TXN_METHODS.includes(base.getText())) {
        if (!ts.isCallExpression(chain[0]))
          throw Error(`Unsupported ${ts.SyntaxKind[chain[0].kind]} ${chain[0].getText()}`);
        this.processTransaction(node, base.getText(), chain[0].arguments[0], chain[0].typeArguments);
        chain.splice(0, 1);
        return;
      }

      // If this is a global variable
      if (base.getText() === 'globals') {
        if (!ts.isPropertyAccessExpression(chain[0]))
          throw Error(`Unsupported ${ts.SyntaxKind[chain[0].kind]} ${chain[0].getText()}`);
        this.processOpcodeImmediate(chain[0], 'global', chain[0].name.getText());
        chain.splice(0, 1);

        // If this is a custom method like `wideRatio`
      } else if (
        chain[0] &&
        ts.isCallExpression(chain[0]) &&
        this.customMethods[base.getText()] &&
        this.customMethods[base.getText()].check(chain[0])
      ) {
        const callNode = chain[0];
        this.customMethods[base.getText()].fn(callNode);

        chain.splice(0, 1);

        // If this is an opcode
      } else if (
        chain[0] &&
        ts.isCallExpression(chain[0]) &&
        langspec.Ops.map((o) => o.Name).includes(base.getText())
      ) {
        this.processOpcode(chain[0]);
        chain.splice(0, 1);

        // If the base is a variable
      } else if (this.localVariables[base.getText()]) {
        const frame = this.localVariables[base.getText()];

        // If this is an array reference, get the accessors
        if (frame && frame.index === undefined) {
          const frameFollow = this.processFrame(chain[0].expression, chain[0].expression.getText(), true);

          frameFollow.accessors.forEach((e) => accessors.push(e));

          // otherwise just load the value
        } else {
          this.push(node, `frame_dig ${frame.index} // ${base.getText()}: ${frame.type}`, frame.type);
        }
      }
    }

    // Check if this is a custom propertly like `zeroIndex`
    if (chain[0] && ts.isPropertyAccessExpression(chain[0])) {
      const propName = chain[0].name.getText();
      if (this.customProperties[propName]?.check?.(chain[0])) {
        this.customProperties[propName].fn(chain[0]);
        chain.splice(0, 1);
      }
    }

    /** Saves the last accessor so it can be passed to processParentArrayAccess later */
    let lastAccessor: ts.Expression | undefined;

    // Iterate over the remaining unprocessed nodes in the chain and remove them once processed
    const remainingChain = chain.filter((n, i) => {
      // Skip if this is the propertyAccessExpression for a callExpression
      // For example, skip `this.txn.sender.hasAsset` when `this.txn.sender.hasAsset()` will be next
      if (chain[i + 1] && ts.isCallExpression(chain[i + 1])) return false;
      this.addSourceComment(n);

      const abiStr = this.getABITupleString(this.lastType || 'void');

      // If accessing a specific byte in a string/byteslice
      if (['bytes', 'string'].includes(abiStr) && ts.isElementAccessExpression(n)) {
        this.processNode(n.argumentExpression);
        this.pushLines(n, 'int 1', 'extract3');
        this.lastType = abiStr;
        return false;
      }

      // If accessing an array
      if (
        (abiStr.endsWith(')') || abiStr.endsWith(']')) &&
        (ts.isElementAccessExpression(n) || ts.isPropertyAccessExpression(n))
      ) {
        lastAccessor = n;

        // If this is a index into an array ie. `arr[0]`
        if (ts.isElementAccessExpression(n)) accessors.push(n.argumentExpression);
        // If this is a property in an object ie. `myObj.foo`
        if (ts.isPropertyAccessExpression(n)) accessors.push(n.name.getText());

        const accessedType = this.getStackTypeAfterFunction(() => {
          this.processParentArrayAccess(lastAccessor!, accessors.slice(), storageBase || base, newValue);
        });

        const abiAccessedType = this.getABITupleString(accessedType);

        if (!(abiAccessedType.endsWith(']') || abiAccessedType.endsWith(')'))) {
          this.processParentArrayAccess(lastAccessor!, accessors, storageBase || base, newValue);
          accessors.length = 0;
        }

        return false;
      }

      if (ts.isCallExpression(n)) {
        if (!ts.isPropertyAccessExpression(n.expression))
          throw Error(`Unsupported ${ts.SyntaxKind[n.kind]}: ${n.getText()}`);

        const methodName = n.expression.name.getText();

        // If this is a custom method
        if (this.customMethods[methodName]?.check?.(n)) {
          this.customMethods[methodName].fn(n);
          return false;
        }

        // Otherwise assume it's an opcode method ie. `this.app.address.hasAsset(123)`
        const preArgsType = this.lastType;
        n.arguments.forEach((a) => this.processNode(a));
        this.lastType = preArgsType;
        this.processOpcodeImmediate(n, this.lastType, methodName);
        return false;
      }

      // If this is a property access expression assume it's an opcode param
      if (ts.isPropertyAccessExpression(n)) {
        // Check if this is a custom propertly like `zeroIndex`
        if (ts.isPropertyAccessExpression(n)) {
          const propName = n.name.getText();
          if (this.customProperties[propName]?.check?.(n)) {
            this.customProperties[propName].fn(n);
            return false;
          }
        }

        if (chain[i + 1] && ts.isCallExpression(chain[i + 1])) return false;
        this.processOpcodeImmediate(n, this.lastType, n.name.getText());
        return false;
      }

      // Handle the case when an imediate array index is needed ie. txna ApplicationArgs i
      if (this.lastType.startsWith('ImmediateArray:')) {
        this.push(
          n,
          `${this.teal[this.currentProgram].pop()!.teal} ${n.argumentExpression.getText()}`,
          this.lastType.replace('ImmediateArray: ', '')
        );
        return false;
      }

      return true;
    });

    // Process the array access if there are array access elements
    if (accessors.length) {
      this.processParentArrayAccess(lastAccessor!, accessors, storageBase || base, newValue);
    }

    if (remainingChain.length)
      throw Error(
        `LastType: ${this.lastType} | Base (${ts.SyntaxKind[base.kind]}): ${base.getText()} | Chain: ${chain.map((n) =>
          n.getText()
        )}`
      );
  }

  private processSubroutine(fn: ts.MethodDeclaration) {
    const frameStart = this.teal[this.currentProgram].length;

    this.pushVoid(fn, `${this.currentSubroutine.name}:`);
    const lastFrame = JSON.parse(JSON.stringify(this.localVariables));
    this.localVariables = {};

    this.pushLines(
      fn,
      '// Setup the frame for args and return value. Use empty bytes to create space on the stack for local variables if necessary',
      `PENDING_PROTO: ${this.currentSubroutine.name}`
    );

    let argIndex = -1;
    const params = new Array(...fn.parameters);
    params.forEach((p) => {
      if (p.type === undefined) throw new Error();

      let type = this.getABIType(p.type.getText());

      if (type.startsWith('Static')) {
        type = this.getABIType(type);
      }

      this.localVariables[p.name.getText()] = { index: argIndex, type };
      argIndex -= 1;
    });

    this.frameIndex = 0;
    this.processNode(fn.body!);

    if (!['retsub', 'err'].includes(this.teal[this.currentProgram].at(-1)!.teal.split(' ')[0]))
      this.pushVoid(fn, 'retsub');

    this.frameInfo[this.currentSubroutine.name] = {
      start: frameStart,
      end: this.teal[this.currentProgram].length,
      frame: {},
    };

    const currentFrame = this.localVariables;
    const currentFrameInfo = this.frameInfo[this.currentSubroutine.name];

    Object.keys(this.localVariables).forEach((name) => {
      currentFrameInfo.frame[currentFrame[name].index!] = { name, type: currentFrame[name].type };
    });

    this.localVariables = lastFrame;
    this.frameSize[this.currentSubroutine.name] = this.frameIndex;
  }

  private processClearState(fn: ts.MethodDeclaration) {
    if (this.clearStateCompiled) throw Error('duplicate clear state decorator defined');

    this.currentProgram = 'clear';
    if (fn.parameters.length > 0) throw Error('clear state cannot have parameters');
    this.processNode(fn.body!);
    this.pushLines(fn.body!, 'int 1', 'return');
    this.clearStateCompiled = true;
    this.currentProgram = 'approval';
  }

  private isSmallNumber(type: string) {
    const abiType = this.getABIType(type);

    if (!(type.match(/uint\d+$/) || type.match(/ufixed\d+x\d+$/))) return false;
    const width = Number(abiType.match(/\d+/)![0]);
    if (type.startsWith('ufixed64')) return true;

    return width < 64;
  }

  private overflowCheck(node: ts.Node, width: number) {
    if (this.disableOverflowChecks) return;

    this.pushLines(node, 'dup', 'bitlen', `int ${width}`, '<=', 'assert');
  }

  private processRoutableMethod(fn: ts.MethodDeclaration) {
    if (this.currentSubroutine.allows.call.includes('ClearState') || this.currentSubroutine.name === 'clearState') {
      this.processClearState(fn);
      return;
    }

    const headerComment = [`// ${this.getSignature(this.currentSubroutine)}`];

    if (this.currentSubroutine.desc !== '') {
      headerComment.push('//');
      const descLines = this.currentSubroutine.desc.split('\n');
      descLines.forEach((line, i) => {
        const newLine = line
          .trim()
          .replace(/^\/\*\*/, '')
          .replace(/\*\/$/, '')
          .replace(/^\*/, '');
        if (newLine.trim() !== '' || !(i === 0 || i === descLines.length - 1))
          headerComment.push(`// ${newLine.trim()}`);
      });
    }

    while (headerComment.at(-1) === '// ') headerComment.pop();

    if (this.currentProgram !== 'lsig') {
      this.pushLines(fn, ...headerComment, `abi_route_${this.currentSubroutine.name}:`);
    } else {
      this.pushLines(fn, ...headerComment, `route_${this.currentSubroutine.name}:`);
    }

    const returnType = this.currentSubroutine.returns.type
      .replace(/asset|application/, 'uint64')
      .replace('account', 'address');

    if (returnType !== 'void') this.pushLines(fn, '// The ABI return prefix', 'byte 0x151f7c75');

    const argCount = fn.parameters.length;

    const args: { name: string; type: string; desc: string }[] = [];

    let nonTxnArgCount = argCount - fn.parameters.filter((p) => p.type?.getText().includes('Txn')).length + 1;
    let gtxnIndex = 0;

    new Array(...fn.parameters).reverse().forEach((p) => {
      const type = this.getABIType(p!.type!.getText());
      const abiType = type;

      this.pushVoid(p, `// ${p.name.getText()}: ${this.getABIType(abiType).replace(/bytes/g, 'byte[]')}`);

      if (!TXN_TYPES.includes(type)) {
        if (this.currentProgram === 'lsig') this.pushLines(p, `int ${(nonTxnArgCount -= 1)}`, 'args');
        else this.pushVoid(p, `txna ApplicationArgs ${(nonTxnArgCount -= 1)}`);
      }

      if (isRefType(type)) {
        if (this.currentProgram === 'lsig') {
          if (['application', 'asset'].includes(type)) this.pushVoid(p, 'btoi');
        } else {
          this.pushVoid(p, 'btoi');
          this.pushVoid(p, `txnas ${capitalizeFirstChar(type)}s`);
        }
      } else if (TXN_TYPES.includes(type)) {
        this.pushVoid(p, 'txn GroupIndex');
        this.pushVoid(p, `int ${(gtxnIndex += 1)}`);
        this.pushVoid(p, '-');
        if (type !== 'txn') this.pushLines(p, 'dup', 'gtxns TypeEnum', `int ${type}`, '==', 'assert');
      } else if (!this.isDynamicType(type) && type !== 'uint64') {
        this.pushLines(p, 'dup', 'len', `int ${type === 'bool' ? 1 : this.getTypeLength(type)}`, '==', 'assert');
      }

      if (!isRefType(type)) this.checkDecoding(p, type);

      args.push({ name: p.name.getText(), type: this.getABIType(abiType).replace(/bytes/g, 'byte[]'), desc: '' });
    });

    // Only add an ABI method if it allows any non-bare OnComplete calls
    const currentAllows = Object.values(this.currentSubroutine.allows).flat();
    if (currentAllows.length > 0) {
      this.abi.methods.push({
        name: this.currentSubroutine.name,
        readonly: this.currentSubroutine.readonly || undefined,
        args: args.reverse(),
        desc: '',
        returns: { type: returnType, desc: '' },
      });
    }

    this.pushVoid(fn, `// execute ${this.getSignature(this.currentSubroutine)}`);
    this.pushVoid(fn, `callsub ${this.currentSubroutine.name}`);
    this.checkEncoding(fn, returnType);
    if (returnType !== 'void') this.pushLines(fn, 'concat', 'log');
    this.pushLines(fn, 'int 1', 'return');
    this.processSubroutine(fn);
  }

  private processOpcode(node: ts.CallExpression) {
    const opcodeName = node.expression.getText();

    if (opcodeName === 'assert') {
      node.arguments.forEach((a) => {
        this.processNode(a);
        this.pushVoid(a, 'assert');
      });

      return;
    }

    if (this.currentProgram === 'lsig' && opcodeName === 'log') {
      throw Error('Logic signatures cannot log data');
    }

    const opSpec = langspec.Ops.find((o) => o.Name === opcodeName)!;
    let line: string[] = [opcodeName];

    if (opSpec.Size === 1) {
      const preArgsType = this.lastType;
      node.arguments.forEach((a) => this.processNode(a));
      this.lastType = preArgsType;
    } else if (opSpec.Size === 0) {
      line = line.concat(node.arguments.map((a) => a.getText()));
    } else {
      node.arguments.slice(opSpec.Size - 1).forEach((a) => this.processNode(a));
      line = line.concat(
        node.arguments.slice(0, opSpec.Size - 1).map((a) => {
          const immediateArg = this.constants[a.getText()] ? this.constants[a.getText()] : a;

          if (ts.isStringLiteral(immediateArg)) return immediateArg.text;
          if (ts.isNumericLiteral(immediateArg)) return parseInt(immediateArg.text, 10).toString();

          throw Error(`Cannot process ${a.getText()} as immediate argument`);
        })
      );
    }

    let returnType = opSpec.Returns?.at(-1)?.replace('[]byte', 'bytes') || 'void';

    if (opSpec.Name.endsWith('256')) returnType = 'byte[32]';

    this.push(node.expression, line.join(' '), returnType);
  }

  private processTransaction(node: ts.Node, name: string, fields: ts.Node, typeArgs?: ts.NodeArray<ts.TypeNode>) {
    if (this.currentProgram === 'clear') throw Error('Inner transactions not allowed in clear state program');
    if (this.currentProgram === 'lsig') throw Error('Inner transaction not allowed in logic signatures');

    if (!ts.isObjectLiteralExpression(fields)) throw new Error('Transaction fields must be an object literal');
    const method = name.replace('this.pendingGroup.', '').replace(/^(add|send|Inner)/, '');
    const send = name.startsWith('send');
    let txnType = '';

    fields.properties.forEach((p) => {
      const key = p.name?.getText();

      if (key === 'methodArgs') {
        if (typeArgs === undefined || !ts.isTupleTypeNode(typeArgs[0]))
          throw new Error('Transaction call type arguments[0] must be a tuple type');
        const argTypes = typeArgs[0].elements.map((t) => t.getText());

        if (!ts.isPropertyAssignment(p) || !ts.isArrayLiteralExpression(p.initializer))
          throw new Error('methodArgs must be an array');

        p.initializer.elements.forEach((e, i: number) => {
          if (argTypes[i].startsWith('Inner')) {
            const txnTypeArg = (typeArgs[0] as ts.TupleTypeNode).elements[i];
            if (!ts.isTypeReferenceNode(txnTypeArg)) throw Error('Invalid transaction type argument');
            this.processTransaction(e, txnTypeArg.typeName.getText(), e, txnTypeArg.typeArguments);
          }
        });
      }
    });

    switch (method) {
      case 'Payment':
        txnType = TransactionType.PaymentTx;
        break;
      case 'AssetTransfer':
        txnType = TransactionType.AssetTransferTx;
        break;
      case 'MethodCall':
      case 'AppCall':
        txnType = TransactionType.ApplicationCallTx;
        break;
      case 'AssetCreation':
      case 'AssetConfig':
        txnType = TransactionType.AssetConfigTx;
        break;
      case 'AssetFreeze':
        txnType = TransactionType.AssetFreezeTx;
        break;
      case 'OfflineKeyRegistration':
      case 'OnlineKeyRegistration':
        txnType = TransactionType.KeyRegistrationTx;
        break;
      default:
        throw new Error(`Invalid transaction call ${name}`);
    }

    this.pushVoid(node, 'itxn_begin');
    this.pushVoid(node, `int ${txnType}`);
    this.pushVoid(node, 'itxn_field TypeEnum');

    const nameProp = fields.properties.find((p) => p.name?.getText() === 'name');

    if (nameProp && txnType === TransactionType.ApplicationCallTx) {
      if (!ts.isPropertyAssignment(nameProp) || !ts.isStringLiteral(nameProp.initializer))
        throw new Error('Method call name key must be a string');

      if (typeArgs === undefined || !ts.isTupleTypeNode(typeArgs[0]))
        throw new Error('Transaction call type arguments[0] must be a tuple type');

      const argTypes = typeArgs[0].elements.map((t) => this.getABITupleString(this.getABIType(t.getText())));

      let returnType = this.getABIType(typeArgs![1].getText());

      returnType = returnType
        .toLowerCase()
        .replace('asset', 'uint64')
        .replace('account', 'address')
        .replace('application', 'uint64');

      this.pushVoid(
        nameProp,
        `method "${nameProp.initializer.text}(${argTypes.join(',')})${returnType}"`.replace(/bytes/g, 'byte[]')
      );
      this.pushVoid(nameProp, 'itxn_field ApplicationArgs');
    }

    fields.properties.forEach((p) => {
      const key = p.name?.getText();

      if (key === undefined) throw new Error('Key must be defined');

      if (key === 'name' && txnType === TransactionType.ApplicationCallTx) {
        return;
      }

      this.addSourceComment(p, true);
      this.pushComments(p);

      if (key === 'onCompletion') {
        if (!ts.isPropertyAssignment(p) || !ts.isStringLiteral(p.initializer))
          throw new Error('OnCompletion key must be a string');
        this.pushVoid(p.initializer, `int ${p.initializer.text}`);
        this.pushVoid(p, 'itxn_field OnCompletion');
      } else if (key === 'methodArgs') {
        if (typeArgs === undefined || !ts.isTupleTypeNode(typeArgs[0]))
          throw new Error('Transaction call type arguments[0] must be a tuple type');
        const argTypes = typeArgs[0].elements.map((t) => this.getABIType(t.getText()));

        let accountIndex = 1;
        let appIndex = 1;
        let assetIndex = 0;

        if (!ts.isPropertyAssignment(p) || !ts.isArrayLiteralExpression(p.initializer))
          throw new Error('methodArgs must be an array');

        p.initializer.elements.forEach((e, i: number) => {
          if (argTypes[i] === 'account') {
            this.processNode(e);
            this.pushVoid(e, 'itxn_field Accounts');
            this.pushVoid(e, `int ${accountIndex}`);
            this.pushVoid(e, 'itob');
            accountIndex += 1;
          } else if (argTypes[i] === ForeignType.Asset) {
            this.processNode(e);
            this.pushVoid(e, 'itxn_field Assets');
            this.pushVoid(e, `int ${assetIndex}`);
            this.pushVoid(e, 'itob');
            assetIndex += 1;
          } else if (argTypes[i] === ForeignType.Application) {
            this.processNode(e);
            this.pushVoid(e, 'itxn_field Applications');
            this.pushVoid(e, `int ${appIndex}`);
            this.pushVoid(e, 'itob');
            appIndex += 1;
          } else if (argTypes[i] === StackType.uint64) {
            this.processNode(e);
            this.typeComparison(this.lastType, argTypes[i]);
            this.pushVoid(e, 'itob');
          } else if (TXN_TYPES.includes(argTypes[i])) {
            return;
          } else {
            this.processNode(e);
            this.checkEncoding(e, argTypes[i]);
          }
          this.pushVoid(e, 'itxn_field ApplicationArgs');
        });
      } else if (ts.isPropertyAssignment(p) && ts.isArrayLiteralExpression(p.initializer)) {
        p.initializer.elements.forEach((e) => {
          this.processNode(e);
          this.pushVoid(e, `itxn_field ${capitalizeFirstChar(key)}`);
        });
      } else if (ts.isPropertyAssignment(p)) {
        this.processNode(p.initializer);
        this.pushVoid(p, `itxn_field ${capitalizeFirstChar(key)}`);
      } else {
        throw new Error(`Cannot process transaction property: ${p.getText()}`);
      }
    });

    if (!fields.properties.map((p) => p.name?.getText()).includes('fee')) {
      this.pushLines(node, '// Fee field not set, defaulting to 0', 'int 0', 'itxn_field Fee');
    }

    if (send) {
      this.pushLines(node, '// Submit inner transaction', 'itxn_submit');

      if (name === 'sendMethodCall' && typeArgs![1].getText() !== 'void') {
        this.pushLines(node, 'itxn NumLogs', 'int 1', '-', 'itxnas Logs', 'extract 4 0');

        const returnType = this.getABIType(typeArgs![1].getText());
        this.checkDecoding(typeArgs![1], returnType);
        this.lastType = returnType;
      } else if (name === 'sendAssetCreation') {
        this.push(node, 'itxn CreatedAssetID', 'asset');
      }
    }
  }

  /*
    Processes an immediate argument to TEAL opcodes
    For example, "this.txn.sender -> txn Sender"
  */
  private processOpcodeImmediate(
    node: ts.Node,
    calleeType: string,
    name: string,
    checkArgs: boolean = false,
    thisTxn: boolean = false
  ): void {
    let type = calleeType;
    if (TXN_TYPES.includes(type) && !thisTxn) {
      type = 'gtxns';
    } else if (type === ForeignType.Address) {
      type = 'account';
    } else if (type === 'app') {
      type = 'application';
    }

    if (type === 'account') {
      if (name === 'isOptedInToApp') {
        this.pushLines(node, 'app_opted_in');
        this.lastType = 'bool';
        return;
      }
    }

    if (!name.startsWith('has')) {
      if (this.OP_PARAMS[type] === undefined)
        throw Error(`Unknown or unsupported method: ${node.getText()} for type ${type}`);
      const paramObj = this.OP_PARAMS[type].find((p) => {
        let paramName = p.name.replace(/^Acct/, '');

        if (['asset', 'application', 'account', 'itxn'].includes(type) && this.currentProgram === 'lsig') {
          throw Error(`Cannot access ${capitalizeFirstChar(type)} parameters in logic signature`);
        }

        if (type === ForeignType.Application) paramName = paramName.replace(/^App/, '');
        if (type === ForeignType.Asset) paramName = paramName.replace(/^Asset/, '');
        return paramName === capitalizeFirstChar(name);
      });

      if (!paramObj) throw new Error(`Unknown or unsupported method: ${node.getText()}`);

      if (!checkArgs || paramObj.args === 1) {
        paramObj.fn(node);
      }
      return;
    }

    switch (name) {
      case 'hasBalance':
        this.hasMaybeValue(node, 'acct_params_get AcctBalance');
        return;
      case 'hasAsset':
        if (!checkArgs) {
          this.hasMaybeValue(node, 'asset_holding_get AssetBalance');
        }
        return;
      default:
        throw new Error(`Unknown method: ${type}.${name}`);
    }
  }

  async algodCompile(): Promise<void> {
    if (this.currentProgram === 'lsig') {
      await this.algodCompileProgram('lsig');
      return;
    }

    await this.algodCompileProgram('approval');
    await this.algodCompileProgram('clear');
  }

  async algodCompileProgram(program: 'approval' | 'clear' | 'lsig'): Promise<{ result: string; hash: string }> {
    // Replace template variables
    const body = this.teal[program]
      .map((t) => t.teal)
      .map((t) => {
        if (t.match(/push(int|bytes) TMPL_/)) {
          const s = t.trim().split(' ');
          const hex = Buffer.from(s[1]).toString('hex');

          if (s[0] === 'pushint') return `pushint ${parseInt(hex, 16) % 2 ** 64}`;
          return `byte 0x${hex}`;
        }

        return t;
      })
      .join('\n');

    const response = await fetch(`${this.algodServer}:${this.algodPort}/v2/teal/compile?sourcemap=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain',
        'X-Algo-API-Token': this.algodToken,
      },
      body,
    });

    const json = await response.json();

    if (response.status !== 200) {
      // eslint-disable-next-line no-console
      console.error(
        this.teal[program]
          .map((t) => t.teal)
          .map((l, i) => `${i + 1}: ${l}`)
          .join('\n')
      );

      throw new Error(`${response.statusText}: ${json.message}`);
    }

    if (program === 'clear') return json;

    const pcList = json.sourcemap.mappings.split(';').map((m: string) => {
      const decoded = vlq.decode(m);
      if (decoded.length > 2) return decoded[2];
      return undefined;
    });

    let lastLine = 0;

    // eslint-disable-next-line no-restricted-syntax
    for (const [pc, lineDelta] of pcList.entries()) {
      // If the delta is not undefined, the lastLine should be updated with
      // lastLine + the delta
      if (lineDelta !== undefined) {
        lastLine += lineDelta;
      }

      if (!(lastLine in this.lineToPc)) this.lineToPc[lastLine] = [];

      this.lineToPc[lastLine].push(pc);

      // eslint-disable-next-line no-loop-func
      this.pcToLine[pc] = lastLine;
    }

    this.srcMap.forEach((sm) => {
      // eslint-disable-next-line no-param-reassign
      sm.pc = this.lineToPc[sm.teal - 1];
    });

    if (program === 'lsig') {
      const addrLine = this.teal.lsig.find((t) => t.teal.trim() === '// The address of this logic signature is')!;
      addrLine.teal += ` ${json.hash}`;
    }

    return json;
  }

  private addSourceComment(node: ts.Node, force: boolean = false) {
    if (
      !force &&
      node.getStart() >= this.lastSourceCommentRange[0] &&
      node.getEnd() <= this.lastSourceCommentRange[1]
    ) {
      return;
    }

    const lineNum = ts.getLineAndCharacterOfPosition(this.sourceFile, node.getStart()).line + 1;

    if (this.filename.length > 0) {
      this.pushVoid(node, `// ${this.filename}:${lineNum}`);
    }

    const lines = node
      .getText()
      .split('\n')
      .map((l) => `// ${l}`);
    this.pushLines(node, ...lines);

    this.lastSourceCommentRange = [node.getStart(), node.getEnd()];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  appSpec(): any {
    const approval = Buffer.from(this.teal.approval.map((t) => t.teal).join('\n')).toString('base64');
    const clear = Buffer.from(this.teal.clear.map((t) => t.teal).join('\n')).toString('base64');

    const globalDeclared: Record<string, object> = {};
    const localDeclared: Record<string, object> = {};

    const state = {
      global: {
        num_byte_slices: 0,
        num_uints: 0,
      },
      local: {
        num_byte_slices: 0,
        num_uints: 0,
      },
    };
    // eslint-disable-next-line no-restricted-syntax
    for (const [k, v] of Object.entries(this.storageProps)) {
      // eslint-disable-next-line default-case
      // TODO; Proper global/local types?
      switch (v.type) {
        case 'global':
          if (isNumeric(v.valueType)) {
            state.global.num_uints += v.maxKeys || 1;
            if (v.key) globalDeclared[k] = { type: 'uint64', key: v.key };
          } else {
            if (v.key) globalDeclared[k] = { type: 'bytes', key: v.key };
            state.global.num_byte_slices += v.maxKeys || 1;
          }

          break;
        case 'local':
          if (isNumeric(v.valueType)) {
            state.local.num_uints += v.maxKeys || 1;
            if (v.key) localDeclared[k] = { type: 'uint64', key: v.key };
          } else {
            state.local.num_byte_slices += v.maxKeys || 1;
            if (v.key) localDeclared[k] = { type: 'bytes', key: v.key };
          }
          break;
        default:
          // TODO: boxes?
          break;
      }
    }

    if (state.global.num_uints + state.global.num_byte_slices > 64) {
      throw new Error('over allocated global state');
    }

    if (state.local.num_uints + state.local.num_byte_slices > 16) {
      throw new Error('over allocated local state');
    }

    const hints: { [signature: string]: { call_config: { [action: string]: string } } } = {};

    const appSpec = {
      hints,
      bare_call_config: {
        no_op: this.bareCallConfig.NoOp?.action || 'NEVER',
        opt_in: this.bareCallConfig.OptIn?.action || 'NEVER',
        close_out: this.bareCallConfig.CloseOut?.action || 'NEVER',
        update_application: this.bareCallConfig.UpdateApplication?.action || 'NEVER',
        delete_application: this.bareCallConfig.DeleteApplication?.action || 'NEVER',
      },
      schema: {
        local: { declared: localDeclared, reserved: {} },
        global: { declared: globalDeclared, reserved: {} },
      },
      state,
      source: { approval, clear },
      contract: this.abi,
    };

    this.abi.methods.forEach((m) => {
      const signature = `${m.name}(${m.args.map((a) => a.type).join(',')})${m.returns.type}`;

      hints[signature] = {
        call_config: {},
      };

      const subroutine = this.subroutines.find((s) => s.name === m.name)!;

      subroutine.allows.create.forEach((oc) => {
        if (oc === 'ClearState') return;
        const snakeOC = oc
          .split(/\.?(?=[A-Z])/)
          .join('_')
          .toLowerCase();
        hints[signature].call_config[snakeOC] = 'CREATE';
      });

      subroutine.allows.call.forEach((oc) => {
        if (oc === 'ClearState') return;
        const snakeOC = oc
          .split(/\.?(?=[A-Z])/)
          .join('_')
          .toLowerCase();
        hints[signature].call_config[snakeOC] = 'CALL';
      });
    });

    return appSpec;
  }

  // eslint-disable-next-line class-methods-use-this
  prettyTeal(teal: NodeAndTEAL[]): NodeAndTEAL[] {
    const output: NodeAndTEAL[] = [];
    let comments: string[] = [];

    let hitFirstLabel = false;
    let lastIsLabel: boolean = false;

    teal.forEach((t, i) => {
      const tealLine = t.teal;
      if (tealLine === '// No extra bytes needed for this subroutine') return;
      if (tealLine === '//#pragma mode logicsig') {
        output.push({ node: this.classNode, teal: tealLine });
        return;
      }

      if (tealLine.startsWith('//')) {
        if (comments.length === 0 && output.at(-1)!.teal !== '' && !lastIsLabel)
          output.push({ node: this.classNode, teal: '' });
        comments.push(tealLine);
        return;
      }

      const isLabel = !tealLine.startsWith('byte ') && tealLine.split('//')[0].endsWith(':');

      if (isLabel && output.at(-1)!.teal !== '') output.push({ node: this.classNode, teal: '' });

      hitFirstLabel = hitFirstLabel || isLabel;

      if (isLabel || tealLine.startsWith('#') || !hitFirstLabel) {
        comments.forEach((c) => output.push({ node: t.node, teal: c }));
        comments = [];
        output.push({ node: t.node, teal: tealLine });
        lastIsLabel = isLabel;
      } else {
        comments.forEach((c) => output.push({ node: t.node, teal: `\t${c.replace(/\n/g, '\n\t')}` }));
        comments = [];
        output.push({ node: t.node, teal: `\t${tealLine}` });
        lastIsLabel = false;
      }
    });

    return output;
  }

  /* These are some methods that were started to get the end of a nested tuple element
  private getParentChain(elem: TupleElement, chain: TupleElement[] = []) {
    chain.push(elem);

    if (elem.parent) {
      this.getParentChain(elem.parent, chain);
    }

    return chain.reverse();
  }

  private getNextElement(elem: TupleElement): TupleElement | undefined {
    const { parent } = elem;

    if (parent === undefined) return undefined;

    const grandParent = parent.parent;

    if (grandParent === undefined) return undefined;

    const parentIndex = grandParent.findIndex((e) => e.id === parent.id);
    const nextUncle = grandParent.slice(parentIndex)[0];

    if (!nextUncle) return this.getNextElement(parent);

    return nextUncle;
  }

  private getElementEnd(elem: TupleElement, accessors: number[]) {
    const parent = elem.parent!;

    if (parent.arrayType === 'tuple') {
      const elemIndex = parent.findIndex((e) => e.id === elem.id);
      const dynamicSibling = parent.slice(elemIndex).find((e) => this.isDynamicType(e.type));

      if (dynamicSibling) {
        // eslint-disable-next-line no-param-reassign
        accessors[accessors.length - 1] += 1;
        this.getElementEnd(dynamicSibling, accessors);
        return;
      }
    } else if (parent.arrayType === 'dynamic') {
      // get the head of the parent, extract_uint16
      this.getElementHead(parent, accessors.slice(0, accessors.length - 1));
      // extract uint16 to get the length
      this.pushLines('extract_uint16, extract_uint16 // get length', 'btoi');
      // see if acc is less than length
      // if so, add two to current head and extract_uint16
      // else TBD
    } else if (parent.arrayType === 'static') {
      // if acc < elem.staticLength, add two to current head and extract_uint16
      // else TBD
    }

    const nextElement = this.getNextElement(elem);
  }
  */
}
