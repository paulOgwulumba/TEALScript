import algosdk from "algosdk";
import * as bkr from "beaker-ts";
export class AbiTest extends bkr.ApplicationClient {
    desc: string = "";
    override appSchema: bkr.Schema = { declared: {}, reserved: {} };
    override acctSchema: bkr.Schema = { declared: {}, reserved: {} };
    override approvalProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDgKCWIgbWFpbgoKYmFyZV9yb3V0ZV9jcmVhdGU6CglieXRlIDB4CglkdXBuIDEyNwoJY2FsbHN1YiBjcmVhdGUKCWludCAxCglyZXR1cm4KCmNyZWF0ZToKCXByb3RvIDEyOCAwCglyZXRzdWIKCmFiaV9yb3V0ZV92YXJpYWJsZUFycmF5OgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCWJ5dGUgMHgKCWR1cG4gMTI3CgljYWxsc3ViIHZhcmlhYmxlQXJyYXkKCWludCAxCglyZXR1cm4KCnZhcmlhYmxlQXJyYXk6Cglwcm90byAxMjggMAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6MTUKCS8vIGM6IHVpbnQ2NFtdID0gWzExLCAyMiwgMzNdCglpbnQgMTEKCWl0b2IKCWludCAyMgoJaXRvYgoJY29uY2F0CglpbnQgMzMKCWl0b2IKCWNvbmNhdAoJc3RvcmUgMAoJYnl0ZSAweDAwCglmcmFtZV9idXJ5IC0xMjggLy8gYzogdWludDY0W10KCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjE3CgkvLyBhc3NlcnQoY1sxXSA9PT0gMjIpCglmcmFtZV9kaWcgLTEyOCAvLyBjOiB1aW50NjRbXQoJYnRvaQoJbG9hZHMKCWV4dHJhY3QgOCA4CglidG9pCglpbnQgMjIKCT09Cglhc3NlcnQKCXJldHN1YgoKYWJpX3JvdXRlX3RocmVlRGltZW5zaW9uYWxBcnJheToKCXR4biBPbkNvbXBsZXRpb24KCWludCBOb09wCgk9PQoJYXNzZXJ0CglieXRlIDB4CglkdXBuIDEyNwoJY2FsbHN1YiB0aHJlZURpbWVuc2lvbmFsQXJyYXkKCWludCAxCglyZXR1cm4KCnRocmVlRGltZW5zaW9uYWxBcnJheToKCXByb3RvIDEyOCAwCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czoyMQoJLy8gYzogdWludDY0W11bXVtdID0gW1tbMTEsIDIyXSwgWzMzLCA0NF1dLCBbWzU1LCA2Nl0sIFs3NywgODhdXV0KCWludCAxMQoJaXRvYgoJaW50IDIyCglpdG9iCgljb25jYXQKCXN0b3JlIDEKCWJ5dGUgMHgwMQoJaW50IDMzCglpdG9iCglpbnQgNDQKCWl0b2IKCWNvbmNhdAoJc3RvcmUgMgoJYnl0ZSAweDAyCgljb25jYXQKCXN0b3JlIDMKCWJ5dGUgMHgwMwoJaW50IDU1CglpdG9iCglpbnQgNjYKCWl0b2IKCWNvbmNhdAoJc3RvcmUgNAoJYnl0ZSAweDA0CglpbnQgNzcKCWl0b2IKCWludCA4OAoJaXRvYgoJY29uY2F0CglzdG9yZSA1CglieXRlIDB4MDUKCWNvbmNhdAoJc3RvcmUgNgoJYnl0ZSAweDA2Cgljb25jYXQKCXN0b3JlIDcKCWJ5dGUgMHgwNwoJZnJhbWVfYnVyeSAtMTI4IC8vIGM6IHVpbnQ2NFtdW11bXQoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6MjMKCS8vIGFzc2VydChjWzFdWzFdWzFdID09PSA4OCkKCWZyYW1lX2RpZyAtMTI4IC8vIGM6IHVpbnQ2NFtdW11bXQoJYnRvaQoJbG9hZHMKCWV4dHJhY3QgMSAxCglidG9pCglsb2FkcwoJZXh0cmFjdCAxIDEKCWJ0b2kKCWxvYWRzCglleHRyYWN0IDggOAoJYnRvaQoJaW50IDg4Cgk9PQoJYXNzZXJ0CglyZXRzdWIKCmFiaV9yb3V0ZV9ub25MaXRlcmFsQWNjZXNzOgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCWJ5dGUgMHgKCWR1cG4gMTI3CgljYWxsc3ViIG5vbkxpdGVyYWxBY2Nlc3MKCWludCAxCglyZXR1cm4KCm5vbkxpdGVyYWxBY2Nlc3M6Cglwcm90byAxMjggMAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6MjcKCS8vIGM6IHVpbnQ2NFtdW11bXSA9IFtbWzExLCAyMl0sIFszMywgNDRdXSwgW1s1NSwgNjZdLCBbNzcsIDg4XV1dCglpbnQgMTEKCWl0b2IKCWludCAyMgoJaXRvYgoJY29uY2F0CglzdG9yZSA4CglieXRlIDB4MDgKCWludCAzMwoJaXRvYgoJaW50IDQ0CglpdG9iCgljb25jYXQKCXN0b3JlIDkKCWJ5dGUgMHgwOQoJY29uY2F0CglzdG9yZSAxMAoJYnl0ZSAweDBhCglpbnQgNTUKCWl0b2IKCWludCA2NgoJaXRvYgoJY29uY2F0CglzdG9yZSAxMQoJYnl0ZSAweDBiCglpbnQgNzcKCWl0b2IKCWludCA4OAoJaXRvYgoJY29uY2F0CglzdG9yZSAxMgoJYnl0ZSAweDBjCgljb25jYXQKCXN0b3JlIDEzCglieXRlIDB4MGQKCWNvbmNhdAoJc3RvcmUgMTQKCWJ5dGUgMHgwZQoJZnJhbWVfYnVyeSAtMTI4IC8vIGM6IHVpbnQ2NFtdW11bXQoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6MjgKCS8vIGkgPSAxICsgMAoJaW50IDEKCWludCAwCgkrCglmcmFtZV9idXJ5IC0xMjcgLy8gaTogdWludDY0CgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czozMAoJLy8gYXNzZXJ0KGNbaV1baV1baV0gPT09IDg4KQoJZnJhbWVfZGlnIC0xMjggLy8gYzogdWludDY0W11bXVtdCglidG9pCglsb2FkcwoJZnJhbWVfZGlnIC0xMjcgLy8gaTogdWludDY0CglpbnQgMQoJZXh0cmFjdDMKCWJ0b2kKCWxvYWRzCglmcmFtZV9kaWcgLTEyNyAvLyBpOiB1aW50NjQKCWludCAxCglleHRyYWN0MwoJYnRvaQoJbG9hZHMKCWludCA4CglmcmFtZV9kaWcgLTEyNyAvLyBpOiB1aW50NjQKCSoKCWludCA4CglleHRyYWN0MwoJYnRvaQoJaW50IDg4Cgk9PQoJYXNzZXJ0CglyZXRzdWIKCmFiaV9yb3V0ZV9zZXRBcnJheVZhbHVlOgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCWJ5dGUgMHgKCWR1cG4gMTI3CgljYWxsc3ViIHNldEFycmF5VmFsdWUKCWludCAxCglyZXR1cm4KCnNldEFycmF5VmFsdWU6Cglwcm90byAxMjggMAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6MzQKCS8vIGM6IHVpbnQ2NFtdID0gWzEsIDIsIDMsIDQsIDVdCglpbnQgMQoJaXRvYgoJaW50IDIKCWl0b2IKCWNvbmNhdAoJaW50IDMKCWl0b2IKCWNvbmNhdAoJaW50IDQKCWl0b2IKCWNvbmNhdAoJaW50IDUKCWl0b2IKCWNvbmNhdAoJc3RvcmUgMTUKCWJ5dGUgMHgwZgoJZnJhbWVfYnVyeSAtMTI4IC8vIGM6IHVpbnQ2NFtdCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czozNgoJLy8gY1sxXSA9IDIyCglmcmFtZV9kaWcgLTEyOCAvLyBjOiB1aW50NjRbXQoJYnRvaQoJZHVwCglsb2FkcwoJaW50IDEKCWludCA4CgkqCglpbnQgMjIKCWl0b2IKCXJlcGxhY2UzCglzdG9yZXMKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjM4CgkvLyBhc3NlcnQoY1sxXSA9PT0gMjIpCglmcmFtZV9kaWcgLTEyOCAvLyBjOiB1aW50NjRbXQoJYnRvaQoJbG9hZHMKCWV4dHJhY3QgOCA4CglidG9pCglpbnQgMjIKCT09Cglhc3NlcnQKCXJldHN1YgoKYWJpX3JvdXRlX3NldE5lc3RlZEFycmF5VmFsdWU6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJYnl0ZSAweAoJZHVwbiAxMjcKCWNhbGxzdWIgc2V0TmVzdGVkQXJyYXlWYWx1ZQoJaW50IDEKCXJldHVybgoKc2V0TmVzdGVkQXJyYXlWYWx1ZToKCXByb3RvIDEyOCAwCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo0MgoJLy8gYzogdWludDY0W11bXSA9IFtbMSwgMl0sIFszLCA0XV0KCWludCAxCglpdG9iCglpbnQgMgoJaXRvYgoJY29uY2F0CglzdG9yZSAxNgoJYnl0ZSAweDEwCglpbnQgMwoJaXRvYgoJaW50IDQKCWl0b2IKCWNvbmNhdAoJc3RvcmUgMTcKCWJ5dGUgMHgxMQoJY29uY2F0CglzdG9yZSAxOAoJYnl0ZSAweDEyCglmcmFtZV9idXJ5IC0xMjggLy8gYzogdWludDY0W11bXQoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6NDMKCS8vIGkgPSAxCglpbnQgMQoJZnJhbWVfYnVyeSAtMTI3IC8vIGk6IHVpbnQ2NAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6NDUKCS8vIGNbaV1baV0gPSA0NAoJZnJhbWVfZGlnIC0xMjggLy8gYzogdWludDY0W11bXQoJYnRvaQoJbG9hZHMKCWZyYW1lX2RpZyAtMTI3IC8vIGk6IHVpbnQ2NAoJaW50IDEKCWV4dHJhY3QzCglidG9pCglkdXAKCWxvYWRzCglmcmFtZV9kaWcgLTEyNyAvLyBpOiB1aW50NjQKCWludCA4CgkqCglpbnQgNDQKCWl0b2IKCXJlcGxhY2UzCglzdG9yZXMKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjQ3CgkvLyBhc3NlcnQoY1tpXVtpXSA9PT0gNDQpCglmcmFtZV9kaWcgLTEyOCAvLyBjOiB1aW50NjRbXVtdCglidG9pCglsb2FkcwoJZnJhbWVfZGlnIC0xMjcgLy8gaTogdWludDY0CglpbnQgMQoJZXh0cmFjdDMKCWJ0b2kKCWxvYWRzCglpbnQgOAoJZnJhbWVfZGlnIC0xMjcgLy8gaTogdWludDY0CgkqCglpbnQgOAoJZXh0cmFjdDMKCWJ0b2kKCWludCA0NAoJPT0KCWFzc2VydAoJcmV0c3ViCgphYmlfcm91dGVfc3RyaW5nQXJyYXk6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJYnl0ZSAweAoJZHVwbiAxMjcKCWNhbGxzdWIgc3RyaW5nQXJyYXkKCWludCAxCglyZXR1cm4KCnN0cmluZ0FycmF5OgoJcHJvdG8gMTI4IDAKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjUxCgkvLyBjOiBzdHJpbmdbXSA9IFsnaGVsbG8nLCAnd29ybGQnLCAndGVzdCcsICcxMjMnXQoJYnl0ZSAiaGVsbG8iCglieXRlICJ3b3JsZCIKCWJ5dGUgInRlc3QiCglieXRlICIxMjMiCglzdG9yZSAxOQoJYnl0ZSAweDEzCglzd2FwCglzdG9yZSAyMAoJYnl0ZSAweDE0Cglzd2FwCgljb25jYXQKCXN3YXAKCXN0b3JlIDIxCglieXRlIDB4MTUKCXN3YXAKCWNvbmNhdAoJc3dhcAoJc3RvcmUgMjIKCWJ5dGUgMHgxNgoJc3dhcAoJY29uY2F0CglzdG9yZSAyMwoJYnl0ZSAweDE3CglmcmFtZV9idXJ5IC0xMjggLy8gYzogYnl0ZXNbXQoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6NTMKCS8vIHJldHVybiBjWzJdOwoJZnJhbWVfZGlnIC0xMjggLy8gYzogYnl0ZXNbXQoJYnRvaQoJbG9hZHMKCWV4dHJhY3QgMiAxCglidG9pCglsb2FkcwoJZHVwCglsZW4KCWl0b2IKCWV4dHJhY3QgNiAwCglzd2FwCgljb25jYXQKCWJ5dGUgMHgxNTFmN2M3NQoJc3dhcAoJY29uY2F0Cglsb2cKCXJldHN1YgoKbWFpbjoKCXR4biBOdW1BcHBBcmdzCglibnogcm91dGVfYWJpCgl0eG4gQXBwbGljYXRpb25JRAoJaW50IDAKCT09CglpbnQgMQoJbWF0Y2ggYmFyZV9yb3V0ZV9jcmVhdGUKCnJvdXRlX2FiaToKCW1ldGhvZCAidmFyaWFibGVBcnJheSgpdm9pZCIKCW1ldGhvZCAidGhyZWVEaW1lbnNpb25hbEFycmF5KCl2b2lkIgoJbWV0aG9kICJub25MaXRlcmFsQWNjZXNzKCl2b2lkIgoJbWV0aG9kICJzZXRBcnJheVZhbHVlKCl2b2lkIgoJbWV0aG9kICJzZXROZXN0ZWRBcnJheVZhbHVlKCl2b2lkIgoJbWV0aG9kICJzdHJpbmdBcnJheSgpc3RyaW5nIgoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMAoJbWF0Y2ggYWJpX3JvdXRlX3ZhcmlhYmxlQXJyYXkgYWJpX3JvdXRlX3RocmVlRGltZW5zaW9uYWxBcnJheSBhYmlfcm91dGVfbm9uTGl0ZXJhbEFjY2VzcyBhYmlfcm91dGVfc2V0QXJyYXlWYWx1ZSBhYmlfcm91dGVfc2V0TmVzdGVkQXJyYXlWYWx1ZSBhYmlfcm91dGVfc3RyaW5nQXJyYXk=";
    override clearProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDgKaW50IDEKcmV0dXJu";
    override methods: algosdk.ABIMethod[] = [
        new algosdk.ABIMethod({ name: "variableArray", desc: "", args: [], returns: { type: "void", desc: "" } }),
        new algosdk.ABIMethod({ name: "threeDimensionalArray", desc: "", args: [], returns: { type: "void", desc: "" } }),
        new algosdk.ABIMethod({ name: "nonLiteralAccess", desc: "", args: [], returns: { type: "void", desc: "" } }),
        new algosdk.ABIMethod({ name: "setArrayValue", desc: "", args: [], returns: { type: "void", desc: "" } }),
        new algosdk.ABIMethod({ name: "setNestedArrayValue", desc: "", args: [], returns: { type: "void", desc: "" } }),
        new algosdk.ABIMethod({ name: "stringArray", desc: "", args: [], returns: { type: "string", desc: "" } })
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
    async stringArray(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<string>> {
        const result = await this.execute(await this.compose.stringArray(txnParams));
        return new bkr.ABIResult<string>(result, result.returnValue as string);
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
        },
        stringArray: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "stringArray"), {}, txnParams, atc);
        }
    };
}
