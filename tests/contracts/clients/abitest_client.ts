import algosdk from "algosdk";
import * as bkr from "beaker-ts";
export class AbiTest extends bkr.ApplicationClient {
    desc: string = "";
    override appSchema: bkr.Schema = { declared: {}, reserved: {} };
    override acctSchema: bkr.Schema = { declared: {}, reserved: {} };
    override approvalProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDgKCWIgbWFpbgoKYmFyZV9yb3V0ZV9jcmVhdGU6CglieXRlIDB4CglkdXBuIDEyNwoJY2FsbHN1YiBjcmVhdGUKCWludCAxCglyZXR1cm4KCmNyZWF0ZToKCXByb3RvIDEyOCAwCglyZXRzdWIKCmFiaV9yb3V0ZV92YXJpYWJsZUFycmF5OgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCWJ5dGUgMHgKCWR1cG4gMTI3CgljYWxsc3ViIHZhcmlhYmxlQXJyYXkKCWludCAxCglyZXR1cm4KCnZhcmlhYmxlQXJyYXk6Cglwcm90byAxMjggMAoKCS8vIGFiaS50czoxNQoJLy8gYzogdWludDY0W10gPSBbMTEsIDIyLCAzM10KCWludCAxMQoJaXRvYgoJaW50IDIyCglpdG9iCgljb25jYXQKCWludCAzMwoJaXRvYgoJY29uY2F0CglzdG9yZSAwCglieXRlIDB4MDAKCWZyYW1lX2J1cnkgLTEyOCAvLyBjOiB1aW50NjRbXQoKCS8vIGFiaS50czoxNwoJLy8gYXNzZXJ0KGNbMV0gPT09IDIyKQoJZnJhbWVfZGlnIC0xMjggLy8gYzogdWludDY0W10KCWJ0b2kKCWxvYWRzCglleHRyYWN0IDggOAoJYnRvaQoJaW50IDIyCgk9PQoJYXNzZXJ0CglyZXRzdWIKCmFiaV9yb3V0ZV90aHJlZURpbWVuc2lvbmFsQXJyYXk6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJYnl0ZSAweAoJZHVwbiAxMjcKCWNhbGxzdWIgdGhyZWVEaW1lbnNpb25hbEFycmF5CglpbnQgMQoJcmV0dXJuCgp0aHJlZURpbWVuc2lvbmFsQXJyYXk6Cglwcm90byAxMjggMAoKCS8vIGFiaS50czoyMQoJLy8gYzogdWludDY0W11bXVtdID0gW1tbMTEsIDIyXSwgWzMzLCA0NF1dLCBbWzU1LCA2Nl0sIFs3NywgODhdXV0KCWludCAxMQoJaXRvYgoJaW50IDIyCglpdG9iCgljb25jYXQKCXN0b3JlIDEKCWJ5dGUgMHgwMQoJaW50IDMzCglpdG9iCglpbnQgNDQKCWl0b2IKCWNvbmNhdAoJc3RvcmUgMgoJYnl0ZSAweDAyCgljb25jYXQKCXN0b3JlIDMKCWJ5dGUgMHgwMwoJaW50IDU1CglpdG9iCglpbnQgNjYKCWl0b2IKCWNvbmNhdAoJc3RvcmUgNAoJYnl0ZSAweDA0CglpbnQgNzcKCWl0b2IKCWludCA4OAoJaXRvYgoJY29uY2F0CglzdG9yZSA1CglieXRlIDB4MDUKCWNvbmNhdAoJc3RvcmUgNgoJYnl0ZSAweDA2Cgljb25jYXQKCXN0b3JlIDcKCWJ5dGUgMHgwNwoJZnJhbWVfYnVyeSAtMTI4IC8vIGM6IHVpbnQ2NFtdW11bXQoKCS8vIGFiaS50czoyMwoJLy8gYXNzZXJ0KGNbMV1bMV1bMV0gPT09IDg4KQoJZnJhbWVfZGlnIC0xMjggLy8gYzogdWludDY0W11bXVtdCglidG9pCglsb2FkcwoJZXh0cmFjdCAxIDEKCWJ0b2kKCWxvYWRzCglleHRyYWN0IDEgMQoJYnRvaQoJbG9hZHMKCWV4dHJhY3QgOCA4CglidG9pCglpbnQgODgKCT09Cglhc3NlcnQKCXJldHN1YgoKYWJpX3JvdXRlX25vbkxpdGVyYWxBY2Nlc3M6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJYnl0ZSAweAoJZHVwbiAxMjcKCWNhbGxzdWIgbm9uTGl0ZXJhbEFjY2VzcwoJaW50IDEKCXJldHVybgoKbm9uTGl0ZXJhbEFjY2VzczoKCXByb3RvIDEyOCAwCgoJLy8gYWJpLnRzOjI3CgkvLyBjOiB1aW50NjRbXVtdW10gPSBbW1sxMSwgMjJdLCBbMzMsIDQ0XV0sIFtbNTUsIDY2XSwgWzc3LCA4OF1dXQoJaW50IDExCglpdG9iCglpbnQgMjIKCWl0b2IKCWNvbmNhdAoJc3RvcmUgOAoJYnl0ZSAweDA4CglpbnQgMzMKCWl0b2IKCWludCA0NAoJaXRvYgoJY29uY2F0CglzdG9yZSA5CglieXRlIDB4MDkKCWNvbmNhdAoJc3RvcmUgMTAKCWJ5dGUgMHgwYQoJaW50IDU1CglpdG9iCglpbnQgNjYKCWl0b2IKCWNvbmNhdAoJc3RvcmUgMTEKCWJ5dGUgMHgwYgoJaW50IDc3CglpdG9iCglpbnQgODgKCWl0b2IKCWNvbmNhdAoJc3RvcmUgMTIKCWJ5dGUgMHgwYwoJY29uY2F0CglzdG9yZSAxMwoJYnl0ZSAweDBkCgljb25jYXQKCXN0b3JlIDE0CglieXRlIDB4MGUKCWZyYW1lX2J1cnkgLTEyOCAvLyBjOiB1aW50NjRbXVtdW10KCgkvLyBhYmkudHM6MjgKCS8vIGkgPSAxICsgMAoJaW50IDEKCWludCAwCgkrCglmcmFtZV9idXJ5IC0xMjcgLy8gaTogdWludDY0CgoJLy8gYWJpLnRzOjMwCgkvLyBhc3NlcnQoY1tpXVtpXVtpXSA9PT0gODgpCglmcmFtZV9kaWcgLTEyOCAvLyBjOiB1aW50NjRbXVtdW10KCWJ0b2kKCWxvYWRzCglmcmFtZV9kaWcgLTEyNyAvLyBpOiB1aW50NjQKCWludCAxCglleHRyYWN0MwoJYnRvaQoJbG9hZHMKCWZyYW1lX2RpZyAtMTI3IC8vIGk6IHVpbnQ2NAoJaW50IDEKCWV4dHJhY3QzCglidG9pCglsb2FkcwoJaW50IDgKCWZyYW1lX2RpZyAtMTI3IC8vIGk6IHVpbnQ2NAoJKgoJaW50IDgKCWV4dHJhY3QzCglidG9pCglpbnQgODgKCT09Cglhc3NlcnQKCXJldHN1YgoKYWJpX3JvdXRlX3NldEFycmF5VmFsdWU6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJYnl0ZSAweAoJZHVwbiAxMjcKCWNhbGxzdWIgc2V0QXJyYXlWYWx1ZQoJaW50IDEKCXJldHVybgoKc2V0QXJyYXlWYWx1ZToKCXByb3RvIDEyOCAwCgoJLy8gYWJpLnRzOjM0CgkvLyBjOiB1aW50NjRbXSA9IFsxLCAyLCAzLCA0LCA1XQoJaW50IDEKCWl0b2IKCWludCAyCglpdG9iCgljb25jYXQKCWludCAzCglpdG9iCgljb25jYXQKCWludCA0CglpdG9iCgljb25jYXQKCWludCA1CglpdG9iCgljb25jYXQKCXN0b3JlIDE1CglieXRlIDB4MGYKCWZyYW1lX2J1cnkgLTEyOCAvLyBjOiB1aW50NjRbXQoKCS8vIGFiaS50czozNgoJLy8gY1sxXSA9IDIyCglmcmFtZV9kaWcgLTEyOCAvLyBjOiB1aW50NjRbXQoJYnRvaQoJZHVwCglsb2FkcwoJaW50IDEKCWludCA4CgkqCglpbnQgMjIKCWl0b2IKCXJlcGxhY2UzCglzdG9yZXMKCgkvLyBhYmkudHM6MzgKCS8vIGFzc2VydChjWzFdID09PSAyMikKCWZyYW1lX2RpZyAtMTI4IC8vIGM6IHVpbnQ2NFtdCglidG9pCglsb2FkcwoJZXh0cmFjdCA4IDgKCWJ0b2kKCWludCAyMgoJPT0KCWFzc2VydAoJcmV0c3ViCgphYmlfcm91dGVfc2V0TmVzdGVkQXJyYXlWYWx1ZToKCXR4biBPbkNvbXBsZXRpb24KCWludCBOb09wCgk9PQoJYXNzZXJ0CglieXRlIDB4CglkdXBuIDEyNwoJY2FsbHN1YiBzZXROZXN0ZWRBcnJheVZhbHVlCglpbnQgMQoJcmV0dXJuCgpzZXROZXN0ZWRBcnJheVZhbHVlOgoJcHJvdG8gMTI4IDAKCgkvLyBhYmkudHM6NDIKCS8vIGM6IHVpbnQ2NFtdW10gPSBbWzEsIDJdLCBbMywgNF1dCglpbnQgMQoJaXRvYgoJaW50IDIKCWl0b2IKCWNvbmNhdAoJc3RvcmUgMTYKCWJ5dGUgMHgxMAoJaW50IDMKCWl0b2IKCWludCA0CglpdG9iCgljb25jYXQKCXN0b3JlIDE3CglieXRlIDB4MTEKCWNvbmNhdAoJc3RvcmUgMTgKCWJ5dGUgMHgxMgoJZnJhbWVfYnVyeSAtMTI4IC8vIGM6IHVpbnQ2NFtdW10KCgkvLyBhYmkudHM6NDMKCS8vIGkgPSAxCglpbnQgMQoJZnJhbWVfYnVyeSAtMTI3IC8vIGk6IHVpbnQ2NAoKCS8vIGFiaS50czo0NQoJLy8gY1tpXVtpXSA9IDQ0CglmcmFtZV9kaWcgLTEyOCAvLyBjOiB1aW50NjRbXVtdCglidG9pCglsb2FkcwoJZnJhbWVfZGlnIC0xMjcgLy8gaTogdWludDY0CglpbnQgMQoJZXh0cmFjdDMKCWJ0b2kKCWR1cAoJbG9hZHMKCWZyYW1lX2RpZyAtMTI3IC8vIGk6IHVpbnQ2NAoJaW50IDgKCSoKCWludCA0NAoJaXRvYgoJcmVwbGFjZTMKCXN0b3JlcwoKCS8vIGFiaS50czo0NwoJLy8gYXNzZXJ0KGNbaV1baV0gPT09IDQ0KQoJZnJhbWVfZGlnIC0xMjggLy8gYzogdWludDY0W11bXQoJYnRvaQoJbG9hZHMKCWZyYW1lX2RpZyAtMTI3IC8vIGk6IHVpbnQ2NAoJaW50IDEKCWV4dHJhY3QzCglidG9pCglsb2FkcwoJaW50IDgKCWZyYW1lX2RpZyAtMTI3IC8vIGk6IHVpbnQ2NAoJKgoJaW50IDgKCWV4dHJhY3QzCglidG9pCglpbnQgNDQKCT09Cglhc3NlcnQKCXJldHN1YgoKbWFpbjoKCXR4biBOdW1BcHBBcmdzCglibnogcm91dGVfYWJpCgl0eG4gQXBwbGljYXRpb25JRAoJaW50IDAKCT09CglpbnQgMQoJbWF0Y2ggYmFyZV9yb3V0ZV9jcmVhdGUKCnJvdXRlX2FiaToKCW1ldGhvZCAidmFyaWFibGVBcnJheSgpdm9pZCIKCW1ldGhvZCAidGhyZWVEaW1lbnNpb25hbEFycmF5KCl2b2lkIgoJbWV0aG9kICJub25MaXRlcmFsQWNjZXNzKCl2b2lkIgoJbWV0aG9kICJzZXRBcnJheVZhbHVlKCl2b2lkIgoJbWV0aG9kICJzZXROZXN0ZWRBcnJheVZhbHVlKCl2b2lkIgoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMAoJbWF0Y2ggYWJpX3JvdXRlX3ZhcmlhYmxlQXJyYXkgYWJpX3JvdXRlX3RocmVlRGltZW5zaW9uYWxBcnJheSBhYmlfcm91dGVfbm9uTGl0ZXJhbEFjY2VzcyBhYmlfcm91dGVfc2V0QXJyYXlWYWx1ZSBhYmlfcm91dGVfc2V0TmVzdGVkQXJyYXlWYWx1ZQ==";
    override clearProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDgKaW50IDEKcmV0dXJu";
    override methods: algosdk.ABIMethod[] = [
        new algosdk.ABIMethod({ name: "variableArray", desc: "", args: [], returns: { type: "void", desc: "" } }),
        new algosdk.ABIMethod({ name: "threeDimensionalArray", desc: "", args: [], returns: { type: "void", desc: "" } }),
        new algosdk.ABIMethod({ name: "nonLiteralAccess", desc: "", args: [], returns: { type: "void", desc: "" } }),
        new algosdk.ABIMethod({ name: "setArrayValue", desc: "", args: [], returns: { type: "void", desc: "" } }),
        new algosdk.ABIMethod({ name: "setNestedArrayValue", desc: "", args: [], returns: { type: "void", desc: "" } })
    ];
    async variableArray(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<void>> {
        const result = await this.execute(await this.compose.variableArray(txnParams));
        return new bkr.ABIResult<void>(result);
    }
    async threeDimensionalArray(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<void>> {
        const result = await this.execute(await this.compose.threeDimensionalArray(txnParams));
        return new bkr.ABIResult<void>(result);
    }
    async nonLiteralAccess(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<void>> {
        const result = await this.execute(await this.compose.nonLiteralAccess(txnParams));
        return new bkr.ABIResult<void>(result);
    }
    async setArrayValue(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<void>> {
        const result = await this.execute(await this.compose.setArrayValue(txnParams));
        return new bkr.ABIResult<void>(result);
    }
    async setNestedArrayValue(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<void>> {
        const result = await this.execute(await this.compose.setNestedArrayValue(txnParams));
        return new bkr.ABIResult<void>(result);
    }
    compose = {
        variableArray: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "variableArray"), {}, txnParams, atc);
        },
        threeDimensionalArray: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "threeDimensionalArray"), {}, txnParams, atc);
        },
        nonLiteralAccess: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "nonLiteralAccess"), {}, txnParams, atc);
        },
        setArrayValue: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "setArrayValue"), {}, txnParams, atc);
        },
        setNestedArrayValue: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "setNestedArrayValue"), {}, txnParams, atc);
        }
    };
}
