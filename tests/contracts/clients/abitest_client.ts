import algosdk from "algosdk";
import * as bkr from "beaker-ts";
export class AbiTest extends bkr.ApplicationClient {
    desc: string = "";
    override appSchema: bkr.Schema = { declared: {}, reserved: {} };
    override acctSchema: bkr.Schema = { declared: {}, reserved: {} };
    override approvalProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDgKCWIgbWFpbgoKdW5tYXJzaGFsOgoJbG9hZCAwCglzd2FwCglzdG9yZXMKCWxvYWQgMAoJaXRvYgoJZXh0cmFjdCA3IDEKCWxvYWQgMAoJaW50IDEKCSsKCXN0b3JlIDAKCXJldHN1YgoKdW5tYXJzaGFsX2J5dGVzOgoJc3dhcAoJY2FsbHN1YiB1bm1hcnNoYWwKCXN3YXAKCXJldHN1YgoKYmFyZV9yb3V0ZV9jcmVhdGU6CglieXRlIDB4CglkdXBuIDEKCWNhbGxzdWIgY3JlYXRlCglpbnQgMQoJcmV0dXJuCgpjcmVhdGU6Cglwcm90byAxIDAKCXJldHN1YgoKYWJpX3JvdXRlX3ZhcmlhYmxlQXJyYXk6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJYnl0ZSAweAoJZHVwbiAyCgljYWxsc3ViIHZhcmlhYmxlQXJyYXkKCWludCAxCglyZXR1cm4KCnZhcmlhYmxlQXJyYXk6Cglwcm90byAyIDAKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjE1CgkvLyBjOiB1aW50NjRbXSA9IFsxMSwgMjIsIDMzXQoJaW50IDExCglpdG9iCglpbnQgMjIKCWl0b2IKCWludCAzMwoJaXRvYgoJYnl0ZSAweAoJY29uY2F0Cgljb25jYXQKCWNvbmNhdAoJY2FsbHN1YiB1bm1hcnNoYWwKCWZyYW1lX2J1cnkgLTEgLy8gYzogdWludDY0W10KCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjE3CgkvLyBhc3NlcnQoY1sxXSA9PT0gMjIpCglmcmFtZV9kaWcgLTEgLy8gYzogdWludDY0W10KCWJ0b2kKCWxvYWRzCglleHRyYWN0IDggOAoJYnRvaQoJaW50IDIyCgk9PQoJYXNzZXJ0CglyZXRzdWIKCmFiaV9yb3V0ZV90aHJlZURpbWVuc2lvbmFsQXJyYXk6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJYnl0ZSAweAoJZHVwbiAyCgljYWxsc3ViIHRocmVlRGltZW5zaW9uYWxBcnJheQoJaW50IDEKCXJldHVybgoKdGhyZWVEaW1lbnNpb25hbEFycmF5OgoJcHJvdG8gMiAwCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czoyMQoJLy8gYzogdWludDY0W11bXVtdID0gW1tbMTEsIDIyXSwgWzMzLCA0NF1dLCBbWzU1LCA2Nl0sIFs3NywgODhdXV0KCWludCAxMQoJaXRvYgoJaW50IDIyCglpdG9iCglieXRlIDB4Cgljb25jYXQKCWNvbmNhdAoJY2FsbHN1YiB1bm1hcnNoYWwKCWludCAzMwoJaXRvYgoJaW50IDQ0CglpdG9iCglieXRlIDB4Cgljb25jYXQKCWNvbmNhdAoJY2FsbHN1YiB1bm1hcnNoYWwKCWJ5dGUgMHgKCWNvbmNhdAoJY29uY2F0CgljYWxsc3ViIHVubWFyc2hhbAoJaW50IDU1CglpdG9iCglpbnQgNjYKCWl0b2IKCWJ5dGUgMHgKCWNvbmNhdAoJY29uY2F0CgljYWxsc3ViIHVubWFyc2hhbAoJaW50IDc3CglpdG9iCglpbnQgODgKCWl0b2IKCWJ5dGUgMHgKCWNvbmNhdAoJY29uY2F0CgljYWxsc3ViIHVubWFyc2hhbAoJYnl0ZSAweAoJY29uY2F0Cgljb25jYXQKCWNhbGxzdWIgdW5tYXJzaGFsCglieXRlIDB4Cgljb25jYXQKCWNvbmNhdAoJY2FsbHN1YiB1bm1hcnNoYWwKCWZyYW1lX2J1cnkgLTEgLy8gYzogdWludDY0W11bXVtdCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czoyMwoJLy8gYXNzZXJ0KGNbMV1bMV1bMV0gPT09IDg4KQoJZnJhbWVfZGlnIC0xIC8vIGM6IHVpbnQ2NFtdW11bXQoJYnRvaQoJbG9hZHMKCWV4dHJhY3QgMSAxCglidG9pCglsb2FkcwoJZXh0cmFjdCAxIDEKCWJ0b2kKCWxvYWRzCglleHRyYWN0IDggOAoJYnRvaQoJaW50IDg4Cgk9PQoJYXNzZXJ0CglyZXRzdWIKCmFiaV9yb3V0ZV9ub25MaXRlcmFsQWNjZXNzOgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCWJ5dGUgMHgKCWR1cG4gMwoJY2FsbHN1YiBub25MaXRlcmFsQWNjZXNzCglpbnQgMQoJcmV0dXJuCgpub25MaXRlcmFsQWNjZXNzOgoJcHJvdG8gMyAwCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czoyNwoJLy8gYzogdWludDY0W11bXVtdID0gW1tbMTEsIDIyXSwgWzMzLCA0NF1dLCBbWzU1LCA2Nl0sIFs3NywgODhdXV0KCWludCAxMQoJaXRvYgoJaW50IDIyCglpdG9iCglieXRlIDB4Cgljb25jYXQKCWNvbmNhdAoJY2FsbHN1YiB1bm1hcnNoYWwKCWludCAzMwoJaXRvYgoJaW50IDQ0CglpdG9iCglieXRlIDB4Cgljb25jYXQKCWNvbmNhdAoJY2FsbHN1YiB1bm1hcnNoYWwKCWJ5dGUgMHgKCWNvbmNhdAoJY29uY2F0CgljYWxsc3ViIHVubWFyc2hhbAoJaW50IDU1CglpdG9iCglpbnQgNjYKCWl0b2IKCWJ5dGUgMHgKCWNvbmNhdAoJY29uY2F0CgljYWxsc3ViIHVubWFyc2hhbAoJaW50IDc3CglpdG9iCglpbnQgODgKCWl0b2IKCWJ5dGUgMHgKCWNvbmNhdAoJY29uY2F0CgljYWxsc3ViIHVubWFyc2hhbAoJYnl0ZSAweAoJY29uY2F0Cgljb25jYXQKCWNhbGxzdWIgdW5tYXJzaGFsCglieXRlIDB4Cgljb25jYXQKCWNvbmNhdAoJY2FsbHN1YiB1bm1hcnNoYWwKCWZyYW1lX2J1cnkgLTEgLy8gYzogdWludDY0W11bXVtdCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czoyOAoJLy8gaSA9IDEgKyAwCglpbnQgMQoJaW50IDAKCSsKCWZyYW1lX2J1cnkgLTIgLy8gaTogdWludDY0CgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czozMAoJLy8gYXNzZXJ0KGNbaV1baV1baV0gPT09IDg4KQoJZnJhbWVfZGlnIC0xIC8vIGM6IHVpbnQ2NFtdW11bXQoJYnRvaQoJbG9hZHMKCWZyYW1lX2RpZyAtMiAvLyBpOiB1aW50NjQKCWludCAxCglleHRyYWN0MwoJYnRvaQoJbG9hZHMKCWZyYW1lX2RpZyAtMiAvLyBpOiB1aW50NjQKCWludCAxCglleHRyYWN0MwoJYnRvaQoJbG9hZHMKCWludCA4CglmcmFtZV9kaWcgLTIgLy8gaTogdWludDY0CgkqCglpbnQgOAoJZXh0cmFjdDMKCWJ0b2kKCWludCA4OAoJPT0KCWFzc2VydAoJcmV0c3ViCgphYmlfcm91dGVfc2V0QXJyYXlWYWx1ZToKCXR4biBPbkNvbXBsZXRpb24KCWludCBOb09wCgk9PQoJYXNzZXJ0CglieXRlIDB4CglkdXBuIDIKCWNhbGxzdWIgc2V0QXJyYXlWYWx1ZQoJaW50IDEKCXJldHVybgoKc2V0QXJyYXlWYWx1ZToKCXByb3RvIDIgMAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6MzQKCS8vIGM6IHVpbnQ2NFtdID0gWzEsIDIsIDMsIDQsIDVdCglpbnQgMQoJaXRvYgoJaW50IDIKCWl0b2IKCWludCAzCglpdG9iCglpbnQgNAoJaXRvYgoJaW50IDUKCWl0b2IKCWJ5dGUgMHgKCWNvbmNhdAoJY29uY2F0Cgljb25jYXQKCWNvbmNhdAoJY29uY2F0CgljYWxsc3ViIHVubWFyc2hhbAoJZnJhbWVfYnVyeSAtMSAvLyBjOiB1aW50NjRbXQoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6MzYKCS8vIGNbMV0gPSAyMgoJZnJhbWVfZGlnIC0xIC8vIGM6IHVpbnQ2NFtdCglidG9pCglkdXAKCWxvYWRzCglpbnQgMQoJaW50IDgKCSoKCWludCAyMgoJaXRvYgoJcmVwbGFjZTMKCXN0b3JlcwoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6MzgKCS8vIGFzc2VydChjWzFdID09PSAyMikKCWZyYW1lX2RpZyAtMSAvLyBjOiB1aW50NjRbXQoJYnRvaQoJbG9hZHMKCWV4dHJhY3QgOCA4CglidG9pCglpbnQgMjIKCT09Cglhc3NlcnQKCXJldHN1YgoKYWJpX3JvdXRlX3NldE5lc3RlZEFycmF5VmFsdWU6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJYnl0ZSAweAoJZHVwbiAzCgljYWxsc3ViIHNldE5lc3RlZEFycmF5VmFsdWUKCWludCAxCglyZXR1cm4KCnNldE5lc3RlZEFycmF5VmFsdWU6Cglwcm90byAzIDAKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjQyCgkvLyBjOiB1aW50NjRbXVtdID0gW1sxLCAyXSwgWzMsIDRdXQoJaW50IDEKCWl0b2IKCWludCAyCglpdG9iCglieXRlIDB4Cgljb25jYXQKCWNvbmNhdAoJY2FsbHN1YiB1bm1hcnNoYWwKCWludCAzCglpdG9iCglpbnQgNAoJaXRvYgoJYnl0ZSAweAoJY29uY2F0Cgljb25jYXQKCWNhbGxzdWIgdW5tYXJzaGFsCglieXRlIDB4Cgljb25jYXQKCWNvbmNhdAoJY2FsbHN1YiB1bm1hcnNoYWwKCWZyYW1lX2J1cnkgLTEgLy8gYzogdWludDY0W11bXQoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6NDMKCS8vIGkgPSAxCglpbnQgMQoJZnJhbWVfYnVyeSAtMiAvLyBpOiB1aW50NjQKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjQ1CgkvLyBjW2ldW2ldID0gNDQKCWZyYW1lX2RpZyAtMSAvLyBjOiB1aW50NjRbXVtdCglidG9pCglsb2FkcwoJZnJhbWVfZGlnIC0yIC8vIGk6IHVpbnQ2NAoJaW50IDEKCWV4dHJhY3QzCglidG9pCglkdXAKCWxvYWRzCglmcmFtZV9kaWcgLTIgLy8gaTogdWludDY0CglpbnQgOAoJKgoJaW50IDQ0CglpdG9iCglyZXBsYWNlMwoJc3RvcmVzCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo0NwoJLy8gYXNzZXJ0KGNbaV1baV0gPT09IDQ0KQoJZnJhbWVfZGlnIC0xIC8vIGM6IHVpbnQ2NFtdW10KCWJ0b2kKCWxvYWRzCglmcmFtZV9kaWcgLTIgLy8gaTogdWludDY0CglpbnQgMQoJZXh0cmFjdDMKCWJ0b2kKCWxvYWRzCglpbnQgOAoJZnJhbWVfZGlnIC0yIC8vIGk6IHVpbnQ2NAoJKgoJaW50IDgKCWV4dHJhY3QzCglidG9pCglpbnQgNDQKCT09Cglhc3NlcnQKCXJldHN1YgoKYWJpX3JvdXRlX3N0cmluZ0FycmF5OgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCWJ5dGUgMHgKCWR1cG4gMgoJY2FsbHN1YiBzdHJpbmdBcnJheQoJaW50IDEKCXJldHVybgoKc3RyaW5nQXJyYXk6Cglwcm90byAyIDAKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjUxCgkvLyBjOiBzdHJpbmdbXSA9IFsnaGVsbG8nLCAnd29ybGQnLCAndGVzdCcsICcxMjMnXQoJYnl0ZSAiaGVsbG8iCglieXRlICJ3b3JsZCIKCWJ5dGUgInRlc3QiCglieXRlICIxMjMiCglieXRlIDB4CgljYWxsc3ViIHVubWFyc2hhbF9ieXRlcwoJY29uY2F0CgljYWxsc3ViIHVubWFyc2hhbF9ieXRlcwoJY29uY2F0CgljYWxsc3ViIHVubWFyc2hhbF9ieXRlcwoJY29uY2F0CgljYWxsc3ViIHVubWFyc2hhbF9ieXRlcwoJY29uY2F0CgljYWxsc3ViIHVubWFyc2hhbAoJZnJhbWVfYnVyeSAtMSAvLyBjOiBieXRlc1tdCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo1MwoJLy8gcmV0dXJuIGNbMl07CglmcmFtZV9kaWcgLTEgLy8gYzogYnl0ZXNbXQoJYnRvaQoJbG9hZHMKCWV4dHJhY3QgMiAxCglidG9pCglsb2FkcwoJZHVwCglsZW4KCWl0b2IKCWV4dHJhY3QgNiAwCglzd2FwCgljb25jYXQKCWJ5dGUgMHgxNTFmN2M3NQoJc3dhcAoJY29uY2F0Cglsb2cKCXJldHN1YgoKYWJpX3JvdXRlX3NldE5lc3RlZEFycmF5OgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCWJ5dGUgMHgKCWR1cG4gMgoJY2FsbHN1YiBzZXROZXN0ZWRBcnJheQoJaW50IDEKCXJldHVybgoKc2V0TmVzdGVkQXJyYXk6Cglwcm90byAyIDAKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjU3CgkvLyBjOiB1aW50NjRbXVtdID0gW1sxLCAyXSwgWzMsIDRdXQoJaW50IDEKCWl0b2IKCWludCAyCglpdG9iCglieXRlIDB4Cgljb25jYXQKCWNvbmNhdAoJY2FsbHN1YiB1bm1hcnNoYWwKCWludCAzCglpdG9iCglpbnQgNAoJaXRvYgoJYnl0ZSAweAoJY29uY2F0Cgljb25jYXQKCWNhbGxzdWIgdW5tYXJzaGFsCglieXRlIDB4Cgljb25jYXQKCWNvbmNhdAoJY2FsbHN1YiB1bm1hcnNoYWwKCWZyYW1lX2J1cnkgLTEgLy8gYzogdWludDY0W11bXQoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6NTkKCS8vIGNbMV0gPSBbMzMsIDQ0XQoJZnJhbWVfZGlnIC0xIC8vIGM6IHVpbnQ2NFtdW10KCWJ0b2kKCWxvYWRzCglleHRyYWN0IDEgMQoJYnRvaQoJaW50IDMzCglpdG9iCglpbnQgNDQKCWl0b2IKCWJ5dGUgMHgKCWNvbmNhdAoJY29uY2F0CgljYWxsc3ViIHVubWFyc2hhbAoJYnRvaQoJbG9hZHMKCXN0b3JlcwoJbG9hZCAwCglpbnQgMQoJLQoJc3RvcmUgMAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6NjEKCS8vIHJldHVybiBjWzFdWzFdOwoJZnJhbWVfZGlnIC0xIC8vIGM6IHVpbnQ2NFtdW10KCWJ0b2kKCWxvYWRzCglleHRyYWN0IDEgMQoJYnRvaQoJbG9hZHMKCWV4dHJhY3QgOCA4CglidG9pCglpdG9iCglieXRlIDB4MTUxZjdjNzUKCXN3YXAKCWNvbmNhdAoJbG9nCglyZXRzdWIKCmFiaV9yb3V0ZV9zZXRNdWx0aU5lc3RlZEFycmF5OgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCWJ5dGUgMHgKCWR1cG4gMgoJY2FsbHN1YiBzZXRNdWx0aU5lc3RlZEFycmF5CglpbnQgMQoJcmV0dXJuCgpzZXRNdWx0aU5lc3RlZEFycmF5OgoJcHJvdG8gMiAwCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo2NQoJLy8gYzogdWludDY0W11bXVtdID0gW1tbMSwgMl0sIFszLCA0XV0sIFtbNSwgNl0sIFs3LCA4XV1dCglpbnQgMQoJaXRvYgoJaW50IDIKCWl0b2IKCWJ5dGUgMHgKCWNvbmNhdAoJY29uY2F0CgljYWxsc3ViIHVubWFyc2hhbAoJaW50IDMKCWl0b2IKCWludCA0CglpdG9iCglieXRlIDB4Cgljb25jYXQKCWNvbmNhdAoJY2FsbHN1YiB1bm1hcnNoYWwKCWJ5dGUgMHgKCWNvbmNhdAoJY29uY2F0CgljYWxsc3ViIHVubWFyc2hhbAoJaW50IDUKCWl0b2IKCWludCA2CglpdG9iCglieXRlIDB4Cgljb25jYXQKCWNvbmNhdAoJY2FsbHN1YiB1bm1hcnNoYWwKCWludCA3CglpdG9iCglpbnQgOAoJaXRvYgoJYnl0ZSAweAoJY29uY2F0Cgljb25jYXQKCWNhbGxzdWIgdW5tYXJzaGFsCglieXRlIDB4Cgljb25jYXQKCWNvbmNhdAoJY2FsbHN1YiB1bm1hcnNoYWwKCWJ5dGUgMHgKCWNvbmNhdAoJY29uY2F0CgljYWxsc3ViIHVubWFyc2hhbAoJZnJhbWVfYnVyeSAtMSAvLyBjOiB1aW50NjRbXVtdW10KCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjY3CgkvLyBjWzFdID0gW1s1NSwgNjZdLCBbNzcsIDg4XV0KCWZyYW1lX2RpZyAtMSAvLyBjOiB1aW50NjRbXVtdW10KCWJ0b2kKCWxvYWRzCglleHRyYWN0IDEgMQoJYnRvaQoJaW50IDU1CglpdG9iCglpbnQgNjYKCWl0b2IKCWJ5dGUgMHgKCWNvbmNhdAoJY29uY2F0CgljYWxsc3ViIHVubWFyc2hhbAoJaW50IDc3CglpdG9iCglpbnQgODgKCWl0b2IKCWJ5dGUgMHgKCWNvbmNhdAoJY29uY2F0CgljYWxsc3ViIHVubWFyc2hhbAoJYnl0ZSAweAoJY29uY2F0Cgljb25jYXQKCWNhbGxzdWIgdW5tYXJzaGFsCglidG9pCglsb2FkcwoJc3RvcmVzCglsb2FkIDAKCWludCAxCgktCglzdG9yZSAwCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo2OQoJLy8gcmV0dXJuIGNbMV1bMV1bMV07CglmcmFtZV9kaWcgLTEgLy8gYzogdWludDY0W11bXVtdCglidG9pCglsb2FkcwoJZXh0cmFjdCAxIDEKCWJ0b2kKCWxvYWRzCglleHRyYWN0IDEgMQoJYnRvaQoJbG9hZHMKCWV4dHJhY3QgOCA4CglidG9pCglpdG9iCglieXRlIDB4MTUxZjdjNzUKCXN3YXAKCWNvbmNhdAoJbG9nCglyZXRzdWIKCmFiaV9yb3V0ZV9hY2NvdW50QXJyYXk6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJYnl0ZSAweAoJZHVwbiAyCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAzCglidG9pCgl0eG5hcyBBY2NvdW50cwoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMgoJYnRvaQoJdHhuYXMgQWNjb3VudHMKCXR4bmEgQXBwbGljYXRpb25BcmdzIDEKCWJ0b2kKCXR4bmFzIEFjY291bnRzCgljYWxsc3ViIGFjY291bnRBcnJheQoJaW50IDEKCXJldHVybgoKYWNjb3VudEFycmF5OgoJcHJvdG8gNSAwCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo3MwoJLy8gYXJyID0gW2EsIGIsIGNdCglmcmFtZV9kaWcgLTEgLy8gYTogQWNjb3VudAoJZnJhbWVfZGlnIC0yIC8vIGI6IEFjY291bnQKCWZyYW1lX2RpZyAtMyAvLyBjOiBBY2NvdW50CglieXRlIDB4Cgljb25jYXQKCWNvbmNhdAoJY29uY2F0CgljYWxsc3ViIHVubWFyc2hhbAoJZnJhbWVfYnVyeSAtNCAvLyBhcnI6IEFjY291bnRbXQoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6NzUKCS8vIHJldHVybiBhcnJbMV07CglmcmFtZV9kaWcgLTQgLy8gYXJyOiBBY2NvdW50W10KCWJ0b2kKCWxvYWRzCglleHRyYWN0IDMyIDMyCglieXRlIDB4MTUxZjdjNzUKCXN3YXAKCWNvbmNhdAoJbG9nCglyZXRzdWIKCmFiaV9yb3V0ZV9hc3NldEFycmF5OgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCWJ5dGUgMHgKCWR1cG4gMgoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMwoJYnRvaQoJdHhuYXMgQXNzZXRzCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAyCglidG9pCgl0eG5hcyBBc3NldHMKCXR4bmEgQXBwbGljYXRpb25BcmdzIDEKCWJ0b2kKCXR4bmFzIEFzc2V0cwoJY2FsbHN1YiBhc3NldEFycmF5CglpbnQgMQoJcmV0dXJuCgphc3NldEFycmF5OgoJcHJvdG8gNSAwCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo3OQoJLy8gYXJyID0gW2EsIGIsIGNdCglmcmFtZV9kaWcgLTEgLy8gYTogQXNzZXQKCWl0b2IKCWZyYW1lX2RpZyAtMiAvLyBiOiBBc3NldAoJaXRvYgoJZnJhbWVfZGlnIC0zIC8vIGM6IEFzc2V0CglpdG9iCglieXRlIDB4Cgljb25jYXQKCWNvbmNhdAoJY29uY2F0CgljYWxsc3ViIHVubWFyc2hhbAoJZnJhbWVfYnVyeSAtNCAvLyBhcnI6IEFzc2V0W10KCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjgxCgkvLyByZXR1cm4gYXJyWzFdOwoJZnJhbWVfZGlnIC00IC8vIGFycjogQXNzZXRbXQoJYnRvaQoJbG9hZHMKCWV4dHJhY3QgOCA4CglidG9pCglpdG9iCglieXRlIDB4MTUxZjdjNzUKCXN3YXAKCWNvbmNhdAoJbG9nCglyZXRzdWIKCmFiaV9yb3V0ZV9hcHBBcnJheToKCXR4biBPbkNvbXBsZXRpb24KCWludCBOb09wCgk9PQoJYXNzZXJ0CglieXRlIDB4CglkdXBuIDIKCXR4bmEgQXBwbGljYXRpb25BcmdzIDMKCWJ0b2kKCXR4bmFzIEFwcGxpY2F0aW9ucwoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMgoJYnRvaQoJdHhuYXMgQXBwbGljYXRpb25zCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAxCglidG9pCgl0eG5hcyBBcHBsaWNhdGlvbnMKCWNhbGxzdWIgYXBwQXJyYXkKCWludCAxCglyZXR1cm4KCmFwcEFycmF5OgoJcHJvdG8gNSAwCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo4NQoJLy8gYXJyID0gW2EsIGIsIGNdCglmcmFtZV9kaWcgLTEgLy8gYTogQXBwbGljYXRpb24KCWl0b2IKCWZyYW1lX2RpZyAtMiAvLyBiOiBBcHBsaWNhdGlvbgoJaXRvYgoJZnJhbWVfZGlnIC0zIC8vIGM6IEFwcGxpY2F0aW9uCglpdG9iCglieXRlIDB4Cgljb25jYXQKCWNvbmNhdAoJY29uY2F0CgljYWxsc3ViIHVubWFyc2hhbAoJZnJhbWVfYnVyeSAtNCAvLyBhcnI6IEFwcGxpY2F0aW9uW10KCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjg3CgkvLyByZXR1cm4gYXJyWzFdOwoJZnJhbWVfZGlnIC00IC8vIGFycjogQXBwbGljYXRpb25bXQoJYnRvaQoJbG9hZHMKCWV4dHJhY3QgOCA4CglidG9pCglpdG9iCglieXRlIDB4MTUxZjdjNzUKCXN3YXAKCWNvbmNhdAoJbG9nCglyZXRzdWIKCmFiaV9yb3V0ZV91aW50MjU2QXJyYXk6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJYnl0ZSAweAoJZHVwbiAyCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAzCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAyCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAxCgljYWxsc3ViIHVpbnQyNTZBcnJheQoJaW50IDEKCXJldHVybgoKdWludDI1NkFycmF5OgoJcHJvdG8gNSAwCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo5MQoJLy8gYXJyID0gW2EsIGIsIGNdCglmcmFtZV9kaWcgLTEgLy8gYTogdWludDI1NgoJZnJhbWVfZGlnIC0yIC8vIGI6IHVpbnQyNTYKCWZyYW1lX2RpZyAtMyAvLyBjOiB1aW50MjU2CglieXRlIDB4Cgljb25jYXQKCWNvbmNhdAoJY29uY2F0CgljYWxsc3ViIHVubWFyc2hhbAoJZnJhbWVfYnVyeSAtNCAvLyBhcnI6IHVpbnQyNTZbXQoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6OTMKCS8vIHJldHVybiBhcnJbMV07CglmcmFtZV9kaWcgLTQgLy8gYXJyOiB1aW50MjU2W10KCWJ0b2kKCWxvYWRzCglleHRyYWN0IDMyIDMyCglieXRlIDB4RkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRgoJYiYKCWJ5dGUgMHgxNTFmN2M3NQoJc3dhcAoJY29uY2F0Cglsb2cKCXJldHN1YgoKYWJpX3JvdXRlX25lc3RlZEFycmF5VmFyaWFibGU6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJYnl0ZSAweAoJZHVwbiAzCgljYWxsc3ViIG5lc3RlZEFycmF5VmFyaWFibGUKCWludCAxCglyZXR1cm4KCm5lc3RlZEFycmF5VmFyaWFibGU6Cglwcm90byAzIDAKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjk3CgkvLyBhMSA9IFszLCA0LCA1XQoJaW50IDMKCWl0b2IKCWludCA0CglpdG9iCglpbnQgNQoJaXRvYgoJYnl0ZSAweAoJY29uY2F0Cgljb25jYXQKCWNvbmNhdAoJY2FsbHN1YiB1bm1hcnNoYWwKCWZyYW1lX2J1cnkgLTEgLy8gYTE6IHVpbnQ2NFtdCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo5OAoJLy8gYTIgPSBbWzEsIDIsIDNdLCBhMV0KCWludCAxCglpdG9iCglpbnQgMgoJaXRvYgoJaW50IDMKCWl0b2IKCWJ5dGUgMHgKCWNvbmNhdAoJY29uY2F0Cgljb25jYXQKCWNhbGxzdWIgdW5tYXJzaGFsCglmcmFtZV9kaWcgLTEgLy8gYTE6IHVpbnQ2NFtdCglieXRlIDB4Cgljb25jYXQKCWNvbmNhdAoJY2FsbHN1YiB1bm1hcnNoYWwKCWZyYW1lX2J1cnkgLTIgLy8gYTI6IHVpbnQ2NFtdW10KCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjEwMAoJLy8gcmV0dXJuIGEyWzFdWzFdOwoJZnJhbWVfZGlnIC0yIC8vIGEyOiB1aW50NjRbXVtdCglidG9pCglsb2FkcwoJZXh0cmFjdCAxIDEKCWJ0b2kKCWxvYWRzCglleHRyYWN0IDggOAoJYnRvaQoJaXRvYgoJYnl0ZSAweDE1MWY3Yzc1Cglzd2FwCgljb25jYXQKCWxvZwoJcmV0c3ViCgphYmlfcm91dGVfc2ltcGxlVHVwbGU6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJYnl0ZSAweAoJZHVwbiAyCgljYWxsc3ViIHNpbXBsZVR1cGxlCglpbnQgMQoJcmV0dXJuCgpzaW1wbGVUdXBsZToKCXByb3RvIDIgMAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6MTA0CgkvLyB0OiBbdWludDgsIHVpbnQ2NCwgdWludDhdID0gWzExIGFzIHVpbnQ4LCAyMiwgMzMgYXMgdWludDhdCglpbnQgMTEKCWl0b2IKCWV4dHJhY3QgNyAwCglpbnQgMjIKCWl0b2IKCWludCAzMwoJaXRvYgoJZXh0cmFjdCA3IDAKCWJ5dGUgMHgKCWNvbmNhdAoJY29uY2F0Cgljb25jYXQKCWNhbGxzdWIgdW5tYXJzaGFsCglmcmFtZV9idXJ5IC0xIC8vIHQ6IFt1aW50OCwgdWludDY0LCB1aW50OF0KCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjEwNgoJLy8gcmV0dXJuIHRbMl07CglmcmFtZV9kaWcgLTEgLy8gdDogW3VpbnQ4LCB1aW50NjQsIHVpbnQ4XQoJYnRvaQoJbG9hZHMKCWV4dHJhY3QgOSAxCglieXRlIDB4RkZGRkZGRkZGRkZGRkZGRgoJYiYKCWJ5dGUgMHgxNTFmN2M3NQoJc3dhcAoJY29uY2F0Cglsb2cKCXJldHN1YgoKYWJpX3JvdXRlX3N0cmluZ0luVHVwbGU6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJYnl0ZSAweAoJZHVwbiAyCgljYWxsc3ViIHN0cmluZ0luVHVwbGUKCWludCAxCglyZXR1cm4KCnN0cmluZ0luVHVwbGU6Cglwcm90byAyIDAKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjExMAoJLy8gdDogW3VpbnQ2NCwgYnl0ZXNdID0gWzExLCAnaGVsbG8gd29ybGQnXQoJaW50IDExCglpdG9iCglieXRlICJoZWxsbyB3b3JsZCIKCWJ5dGUgMHgKCWNhbGxzdWIgdW5tYXJzaGFsX2J5dGVzCgljb25jYXQKCWNvbmNhdAoJY2FsbHN1YiB1bm1hcnNoYWwKCWZyYW1lX2J1cnkgLTEgLy8gdDogW3VpbnQ2NCwgYnl0ZXNdCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czoxMTIKCS8vIHJldHVybiB0WzFdOwoJZnJhbWVfZGlnIC0xIC8vIHQ6IFt1aW50NjQsIGJ5dGVzXQoJYnRvaQoJbG9hZHMKCWV4dHJhY3QgOCAxCglidG9pCglsb2FkcwoJZHVwCglsZW4KCWl0b2IKCWV4dHJhY3QgNiAwCglzd2FwCgljb25jYXQKCWJ5dGUgMHgxNTFmN2M3NQoJc3dhcAoJY29uY2F0Cglsb2cKCXJldHN1YgoKYWJpX3JvdXRlX2FycmF5SW5UdXBsZToKCXR4biBPbkNvbXBsZXRpb24KCWludCBOb09wCgk9PQoJYXNzZXJ0CglieXRlIDB4CglkdXBuIDIKCWNhbGxzdWIgYXJyYXlJblR1cGxlCglpbnQgMQoJcmV0dXJuCgphcnJheUluVHVwbGU6Cglwcm90byAyIDAKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjExNgoJLy8gdDogW3VpbnQ2NCwgdWludDY0W11dID0gWzEsIFsyLCAzLCA0XV0KCWludCAxCglpdG9iCglpbnQgMgoJaXRvYgoJaW50IDMKCWl0b2IKCWludCA0CglpdG9iCglieXRlIDB4Cgljb25jYXQKCWNvbmNhdAoJY29uY2F0CgljYWxsc3ViIHVubWFyc2hhbAoJYnl0ZSAweAoJY29uY2F0Cgljb25jYXQKCWNhbGxzdWIgdW5tYXJzaGFsCglmcmFtZV9idXJ5IC0xIC8vIHQ6IFt1aW50NjQsIHVpbnQ2NFtdXQoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6MTE4CgkvLyByZXR1cm4gdFsxXVsxXTsKCWZyYW1lX2RpZyAtMSAvLyB0OiBbdWludDY0LCB1aW50NjRbXV0KCWJ0b2kKCWxvYWRzCglleHRyYWN0IDggMQoJYnRvaQoJbG9hZHMKCWV4dHJhY3QgOCA4CglidG9pCglpdG9iCglieXRlIDB4MTUxZjdjNzUKCXN3YXAKCWNvbmNhdAoJbG9nCglyZXRzdWIKCmFiaV9yb3V0ZV9yZXR1cm5TdGF0aWNBcnJheToKCXR4biBPbkNvbXBsZXRpb24KCWludCBOb09wCgk9PQoJYXNzZXJ0CglieXRlIDB4CglkdXBuIDIKCWNhbGxzdWIgcmV0dXJuU3RhdGljQXJyYXkKCWludCAxCglyZXR1cm4KCnJldHVyblN0YXRpY0FycmF5OgoJcHJvdG8gMiAwCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czoxMjIKCS8vIGEgPSBbMSwgMiwgM10KCWludCAxCglpdG9iCglpbnQgMgoJaXRvYgoJaW50IDMKCWl0b2IKCWJ5dGUgMHgKCWNvbmNhdAoJY29uY2F0Cgljb25jYXQKCWNhbGxzdWIgdW5tYXJzaGFsCglmcmFtZV9idXJ5IC0xIC8vIGE6IHVpbnQ2NFtdCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czoxMjQKCS8vIHJldHVybiBhOwoJZnJhbWVfZGlnIC0xIC8vIGE6IHVpbnQ2NFtdCglidG9pCglsb2FkcwoJZHVwCglsZW4KCWludCA4CgkvCglpdG9iCglleHRyYWN0IDYgMAoJc3dhcAoJY29uY2F0CglieXRlIDB4MTUxZjdjNzUKCXN3YXAKCWNvbmNhdAoJbG9nCglyZXRzdWIKCm1haW46CglpbnQgMQoJc3RvcmUgMAoJdHhuIE51bUFwcEFyZ3MKCWJueiByb3V0ZV9hYmkKCXR4biBBcHBsaWNhdGlvbklECglpbnQgMAoJPT0KCWludCAxCgltYXRjaCBiYXJlX3JvdXRlX2NyZWF0ZQoKcm91dGVfYWJpOgoJbWV0aG9kICJ2YXJpYWJsZUFycmF5KCl2b2lkIgoJbWV0aG9kICJ0aHJlZURpbWVuc2lvbmFsQXJyYXkoKXZvaWQiCgltZXRob2QgIm5vbkxpdGVyYWxBY2Nlc3MoKXZvaWQiCgltZXRob2QgInNldEFycmF5VmFsdWUoKXZvaWQiCgltZXRob2QgInNldE5lc3RlZEFycmF5VmFsdWUoKXZvaWQiCgltZXRob2QgInN0cmluZ0FycmF5KClzdHJpbmciCgltZXRob2QgInNldE5lc3RlZEFycmF5KCl1aW50NjQiCgltZXRob2QgInNldE11bHRpTmVzdGVkQXJyYXkoKXVpbnQ2NCIKCW1ldGhvZCAiYWNjb3VudEFycmF5KGFjY291bnQsYWNjb3VudCxhY2NvdW50KWFkZHJlc3MiCgltZXRob2QgImFzc2V0QXJyYXkoYXNzZXQsYXNzZXQsYXNzZXQpdWludDY0IgoJbWV0aG9kICJhcHBBcnJheShhcHBsaWNhdGlvbixhcHBsaWNhdGlvbixhcHBsaWNhdGlvbil1aW50NjQiCgltZXRob2QgInVpbnQyNTZBcnJheSh1aW50MjU2LHVpbnQyNTYsdWludDI1Nil1aW50MjU2IgoJbWV0aG9kICJuZXN0ZWRBcnJheVZhcmlhYmxlKCl1aW50NjQiCgltZXRob2QgInNpbXBsZVR1cGxlKCl1aW50NjQiCgltZXRob2QgInN0cmluZ0luVHVwbGUoKXN0cmluZyIKCW1ldGhvZCAiYXJyYXlJblR1cGxlKCl1aW50NjQiCgltZXRob2QgInJldHVyblN0YXRpY0FycmF5KCl1aW50NjRbXSIKCXR4bmEgQXBwbGljYXRpb25BcmdzIDAKCW1hdGNoIGFiaV9yb3V0ZV92YXJpYWJsZUFycmF5IGFiaV9yb3V0ZV90aHJlZURpbWVuc2lvbmFsQXJyYXkgYWJpX3JvdXRlX25vbkxpdGVyYWxBY2Nlc3MgYWJpX3JvdXRlX3NldEFycmF5VmFsdWUgYWJpX3JvdXRlX3NldE5lc3RlZEFycmF5VmFsdWUgYWJpX3JvdXRlX3N0cmluZ0FycmF5IGFiaV9yb3V0ZV9zZXROZXN0ZWRBcnJheSBhYmlfcm91dGVfc2V0TXVsdGlOZXN0ZWRBcnJheSBhYmlfcm91dGVfYWNjb3VudEFycmF5IGFiaV9yb3V0ZV9hc3NldEFycmF5IGFiaV9yb3V0ZV9hcHBBcnJheSBhYmlfcm91dGVfdWludDI1NkFycmF5IGFiaV9yb3V0ZV9uZXN0ZWRBcnJheVZhcmlhYmxlIGFiaV9yb3V0ZV9zaW1wbGVUdXBsZSBhYmlfcm91dGVfc3RyaW5nSW5UdXBsZSBhYmlfcm91dGVfYXJyYXlJblR1cGxlIGFiaV9yb3V0ZV9yZXR1cm5TdGF0aWNBcnJheQ==";
    override clearProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDgKaW50IDEKcmV0dXJu";
    override methods: algosdk.ABIMethod[] = [
        new algosdk.ABIMethod({ name: "variableArray", desc: "", args: [], returns: { type: "void", desc: "" } }),
        new algosdk.ABIMethod({ name: "threeDimensionalArray", desc: "", args: [], returns: { type: "void", desc: "" } }),
        new algosdk.ABIMethod({ name: "nonLiteralAccess", desc: "", args: [], returns: { type: "void", desc: "" } }),
        new algosdk.ABIMethod({ name: "setArrayValue", desc: "", args: [], returns: { type: "void", desc: "" } }),
        new algosdk.ABIMethod({ name: "setNestedArrayValue", desc: "", args: [], returns: { type: "void", desc: "" } }),
        new algosdk.ABIMethod({ name: "stringArray", desc: "", args: [], returns: { type: "string", desc: "" } }),
        new algosdk.ABIMethod({ name: "setNestedArray", desc: "", args: [], returns: { type: "uint64", desc: "" } }),
        new algosdk.ABIMethod({ name: "setMultiNestedArray", desc: "", args: [], returns: { type: "uint64", desc: "" } }),
        new algosdk.ABIMethod({ name: "accountArray", desc: "", args: [{ type: "account", name: "a", desc: "" }, { type: "account", name: "b", desc: "" }, { type: "account", name: "c", desc: "" }], returns: { type: "address", desc: "" } }),
        new algosdk.ABIMethod({ name: "assetArray", desc: "", args: [{ type: "asset", name: "a", desc: "" }, { type: "asset", name: "b", desc: "" }, { type: "asset", name: "c", desc: "" }], returns: { type: "uint64", desc: "" } }),
        new algosdk.ABIMethod({ name: "appArray", desc: "", args: [{ type: "application", name: "a", desc: "" }, { type: "application", name: "b", desc: "" }, { type: "application", name: "c", desc: "" }], returns: { type: "uint64", desc: "" } }),
        new algosdk.ABIMethod({ name: "uint256Array", desc: "", args: [{ type: "uint256", name: "a", desc: "" }, { type: "uint256", name: "b", desc: "" }, { type: "uint256", name: "c", desc: "" }], returns: { type: "uint256", desc: "" } }),
        new algosdk.ABIMethod({ name: "nestedArrayVariable", desc: "", args: [], returns: { type: "uint64", desc: "" } }),
        new algosdk.ABIMethod({ name: "simpleTuple", desc: "", args: [], returns: { type: "uint64", desc: "" } }),
        new algosdk.ABIMethod({ name: "stringInTuple", desc: "", args: [], returns: { type: "string", desc: "" } }),
        new algosdk.ABIMethod({ name: "arrayInTuple", desc: "", args: [], returns: { type: "uint64", desc: "" } }),
        new algosdk.ABIMethod({ name: "returnStaticArray", desc: "", args: [], returns: { type: "uint64[]", desc: "" } })
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
    async setNestedArray(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
        const result = await this.execute(await this.compose.setNestedArray(txnParams));
        return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
    }
    async setMultiNestedArray(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
        const result = await this.execute(await this.compose.setMultiNestedArray(txnParams));
        return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
    }
    async accountArray(args: {
        a: string;
        b: string;
        c: string;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<string>> {
        const result = await this.execute(await this.compose.accountArray({ a: args.a, b: args.b, c: args.c }, txnParams));
        return new bkr.ABIResult<string>(result, result.returnValue as string);
    }
    async assetArray(args: {
        a: bigint;
        b: bigint;
        c: bigint;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
        const result = await this.execute(await this.compose.assetArray({ a: args.a, b: args.b, c: args.c }, txnParams));
        return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
    }
    async appArray(args: {
        a: bigint;
        b: bigint;
        c: bigint;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
        const result = await this.execute(await this.compose.appArray({ a: args.a, b: args.b, c: args.c }, txnParams));
        return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
    }
    async uint256Array(args: {
        a: bigint;
        b: bigint;
        c: bigint;
    }, txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
        const result = await this.execute(await this.compose.uint256Array({ a: args.a, b: args.b, c: args.c }, txnParams));
        return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
    }
    async nestedArrayVariable(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
        const result = await this.execute(await this.compose.nestedArrayVariable(txnParams));
        return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
    }
    async simpleTuple(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
        const result = await this.execute(await this.compose.simpleTuple(txnParams));
        return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
    }
    async stringInTuple(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<string>> {
        const result = await this.execute(await this.compose.stringInTuple(txnParams));
        return new bkr.ABIResult<string>(result, result.returnValue as string);
    }
    async arrayInTuple(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint>> {
        const result = await this.execute(await this.compose.arrayInTuple(txnParams));
        return new bkr.ABIResult<bigint>(result, result.returnValue as bigint);
    }
    async returnStaticArray(txnParams?: bkr.TransactionOverrides): Promise<bkr.ABIResult<bigint[]>> {
        const result = await this.execute(await this.compose.returnStaticArray(txnParams));
        return new bkr.ABIResult<bigint[]>(result, result.returnValue as bigint[]);
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
        },
        setNestedArray: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "setNestedArray"), {}, txnParams, atc);
        },
        setMultiNestedArray: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "setMultiNestedArray"), {}, txnParams, atc);
        },
        accountArray: async (args: {
            a: string;
            b: string;
            c: string;
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "accountArray"), { a: args.a, b: args.b, c: args.c }, txnParams, atc);
        },
        assetArray: async (args: {
            a: bigint;
            b: bigint;
            c: bigint;
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "assetArray"), { a: args.a, b: args.b, c: args.c }, txnParams, atc);
        },
        appArray: async (args: {
            a: bigint;
            b: bigint;
            c: bigint;
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "appArray"), { a: args.a, b: args.b, c: args.c }, txnParams, atc);
        },
        uint256Array: async (args: {
            a: bigint;
            b: bigint;
            c: bigint;
        }, txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "uint256Array"), { a: args.a, b: args.b, c: args.c }, txnParams, atc);
        },
        nestedArrayVariable: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "nestedArrayVariable"), {}, txnParams, atc);
        },
        simpleTuple: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "simpleTuple"), {}, txnParams, atc);
        },
        stringInTuple: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "stringInTuple"), {}, txnParams, atc);
        },
        arrayInTuple: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "arrayInTuple"), {}, txnParams, atc);
        },
        returnStaticArray: async (txnParams?: bkr.TransactionOverrides, atc?: algosdk.AtomicTransactionComposer): Promise<algosdk.AtomicTransactionComposer> => {
            return this.addMethodCall(algosdk.getMethodByName(this.methods, "returnStaticArray"), {}, txnParams, atc);
        }
    };
}
