import { Contract } from '../../src/lib/index';

// eslint-disable-next-line no-unused-vars
class ItxnsTest extends Contract {
  payment(): void {
    sendPayment({
      amount: 100,
      receiver: this.app.address,
      closeRemainderTo: globals.zeroAddress,
      sender: this.app.address,
      rekeyTo: globals.zeroAddress,
      note: 'Hello World!',
    });
  }

  assetCreation(): Asset {
    return sendAssetCreation({
      configAssetName: 'name',
      configAssetUnitName: 'unit',
      configAssetTotal: 1,
      configAssetManager: this.app.address,
      configAssetReserve: this.app.address,
      configAssetFreeze: this.app.address,
      configAssetClawback: this.app.address,
      configAssetDefaultFrozen: 0,
      configAssetURL: 'url',
      configAssetMetadataHash: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    });
  }

  appCall(): void {
    sendAppCall({
      accounts: [this.app.address],
      applicationArgs: ['arg1', 'arg2'],
      applicationID: this.app,
      applications: [this.app],
      approvalProgram: 'approval',
      assets: [Asset.zeroIndex],
      clearStateProgram: 'clear',
      globalNumByteSlice: 1,
      globalNumUint: 1,
      localNumByteSlice: 1,
      localNumUint: 1,
      note: 'note',
    });
  }

  assetConfig(): void {
    sendAssetConfig({
      configAsset: Asset.zeroIndex,
      configAssetManager: this.app.address,
      configAssetReserve: this.app.address,
      configAssetFreeze: this.app.address,
      configAssetClawback: this.app.address,
    });
  }

  assetFreeze(): void {
    sendAssetFreeze({
      freezeAssetFrozen: true,
      freezeAssetAccount: this.app.address,
      freezeAsset: Asset.zeroIndex,
    });
  }

  assetTransfer(): void {
    sendAssetTransfer({
      assetAmount: 1,
      assetCloseTo: this.app.address,
      assetReceiver: this.app.address,
      assetSender: this.app.address,
      xferAsset: Asset.zeroIndex,
    });
  }

  methodCall(): Asset {
    return sendMethodCall<[Application, Asset], Asset>({
      name: 'method',
      methodArgs: [this.app, Asset.zeroIndex],
    });
  }

  onlineKeyRegistration(): void {
    sendOnlineKeyRegistration({
      selectionPK: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      stateProofPK: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
      voteFirst: 1,
      voteKeyDilution: 1,
      voteLast: 1,
      votePK: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa',
    });
  }

  offlineKeyRegistration(): void {
    sendOfflineKeyRegistration({});
  }
}
