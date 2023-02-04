import algosdk from "algosdk";
import * as bkr from "beaker-ts";
export class AbiTest extends bkr.ApplicationClient {
    desc: string = "";
    override appSchema: bkr.Schema = { declared: {}, reserved: {} };
    override acctSchema: bkr.Schema = { declared: {}, reserved: {} };
    override approvalProgram: string = "I3ByYWdtYSB2ZXJzaW9uIDgKCWIgbWFpbgoKYmFyZV9yb3V0ZV9jcmVhdGU6CglieXRlIDB4CglkdXBuIDEKCWNhbGxzdWIgY3JlYXRlCglpbnQgMQoJcmV0dXJuCgpjcmVhdGU6Cglwcm90byAxIDAKCXJldHN1YgoKYWJpX3JvdXRlX3ZhcmlhYmxlQXJyYXk6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJYnl0ZSAweAoJZHVwbiAyCgljYWxsc3ViIHZhcmlhYmxlQXJyYXkKCWludCAxCglyZXR1cm4KCnZhcmlhYmxlQXJyYXk6Cglwcm90byAyIDAKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjE1CgkvLyBjOiB1aW50NjRbXSA9IFsxMSwgMjIsIDMzXQoJaW50IDExCglpdG9iCglpbnQgMjIKCWl0b2IKCWNvbmNhdAoJaW50IDMzCglpdG9iCgljb25jYXQKCWxvYWQgMAoJc3dhcAoJc3RvcmVzCglsb2FkIDAKCWl0b2IKCWV4dHJhY3QgNyAxCglsb2FkIDAKCWludCAxCgkrCglzdG9yZSAwCglmcmFtZV9idXJ5IC0xIC8vIGM6IHVpbnQ2NFtdCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czoxNwoJLy8gYXNzZXJ0KGNbMV0gPT09IDIyKQoJZnJhbWVfZGlnIC0xIC8vIGM6IHVpbnQ2NFtdCglidG9pCglsb2FkcwoJZXh0cmFjdCA4IDgKCWJ0b2kKCWludCAyMgoJPT0KCWFzc2VydAoJcmV0c3ViCgphYmlfcm91dGVfdGhyZWVEaW1lbnNpb25hbEFycmF5OgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCWJ5dGUgMHgKCWR1cG4gMgoJY2FsbHN1YiB0aHJlZURpbWVuc2lvbmFsQXJyYXkKCWludCAxCglyZXR1cm4KCnRocmVlRGltZW5zaW9uYWxBcnJheToKCXByb3RvIDIgMAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6MjEKCS8vIGM6IHVpbnQ2NFtdW11bXSA9IFtbWzExLCAyMl0sIFszMywgNDRdXSwgW1s1NSwgNjZdLCBbNzcsIDg4XV1dCglpbnQgMTEKCWl0b2IKCWludCAyMgoJaXRvYgoJY29uY2F0Cglsb2FkIDAKCXN3YXAKCXN0b3JlcwoJbG9hZCAwCglpdG9iCglleHRyYWN0IDcgMQoJbG9hZCAwCglpbnQgMQoJKwoJc3RvcmUgMAoJaW50IDMzCglpdG9iCglpbnQgNDQKCWl0b2IKCWNvbmNhdAoJbG9hZCAwCglzd2FwCglzdG9yZXMKCWxvYWQgMAoJaXRvYgoJZXh0cmFjdCA3IDEKCWxvYWQgMAoJaW50IDEKCSsKCXN0b3JlIDAKCWNvbmNhdAoJbG9hZCAwCglzd2FwCglzdG9yZXMKCWxvYWQgMAoJaXRvYgoJZXh0cmFjdCA3IDEKCWxvYWQgMAoJaW50IDEKCSsKCXN0b3JlIDAKCWludCA1NQoJaXRvYgoJaW50IDY2CglpdG9iCgljb25jYXQKCWxvYWQgMAoJc3dhcAoJc3RvcmVzCglsb2FkIDAKCWl0b2IKCWV4dHJhY3QgNyAxCglsb2FkIDAKCWludCAxCgkrCglzdG9yZSAwCglpbnQgNzcKCWl0b2IKCWludCA4OAoJaXRvYgoJY29uY2F0Cglsb2FkIDAKCXN3YXAKCXN0b3JlcwoJbG9hZCAwCglpdG9iCglleHRyYWN0IDcgMQoJbG9hZCAwCglpbnQgMQoJKwoJc3RvcmUgMAoJY29uY2F0Cglsb2FkIDAKCXN3YXAKCXN0b3JlcwoJbG9hZCAwCglpdG9iCglleHRyYWN0IDcgMQoJbG9hZCAwCglpbnQgMQoJKwoJc3RvcmUgMAoJY29uY2F0Cglsb2FkIDAKCXN3YXAKCXN0b3JlcwoJbG9hZCAwCglpdG9iCglleHRyYWN0IDcgMQoJbG9hZCAwCglpbnQgMQoJKwoJc3RvcmUgMAoJZnJhbWVfYnVyeSAtMSAvLyBjOiB1aW50NjRbXVtdW10KCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjIzCgkvLyBhc3NlcnQoY1sxXVsxXVsxXSA9PT0gODgpCglmcmFtZV9kaWcgLTEgLy8gYzogdWludDY0W11bXVtdCglidG9pCglsb2FkcwoJZXh0cmFjdCAxIDEKCWJ0b2kKCWxvYWRzCglleHRyYWN0IDEgMQoJYnRvaQoJbG9hZHMKCWV4dHJhY3QgOCA4CglidG9pCglpbnQgODgKCT09Cglhc3NlcnQKCXJldHN1YgoKYWJpX3JvdXRlX25vbkxpdGVyYWxBY2Nlc3M6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJYnl0ZSAweAoJZHVwbiAzCgljYWxsc3ViIG5vbkxpdGVyYWxBY2Nlc3MKCWludCAxCglyZXR1cm4KCm5vbkxpdGVyYWxBY2Nlc3M6Cglwcm90byAzIDAKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjI3CgkvLyBjOiB1aW50NjRbXVtdW10gPSBbW1sxMSwgMjJdLCBbMzMsIDQ0XV0sIFtbNTUsIDY2XSwgWzc3LCA4OF1dXQoJaW50IDExCglpdG9iCglpbnQgMjIKCWl0b2IKCWNvbmNhdAoJbG9hZCAwCglzd2FwCglzdG9yZXMKCWxvYWQgMAoJaXRvYgoJZXh0cmFjdCA3IDEKCWxvYWQgMAoJaW50IDEKCSsKCXN0b3JlIDAKCWludCAzMwoJaXRvYgoJaW50IDQ0CglpdG9iCgljb25jYXQKCWxvYWQgMAoJc3dhcAoJc3RvcmVzCglsb2FkIDAKCWl0b2IKCWV4dHJhY3QgNyAxCglsb2FkIDAKCWludCAxCgkrCglzdG9yZSAwCgljb25jYXQKCWxvYWQgMAoJc3dhcAoJc3RvcmVzCglsb2FkIDAKCWl0b2IKCWV4dHJhY3QgNyAxCglsb2FkIDAKCWludCAxCgkrCglzdG9yZSAwCglpbnQgNTUKCWl0b2IKCWludCA2NgoJaXRvYgoJY29uY2F0Cglsb2FkIDAKCXN3YXAKCXN0b3JlcwoJbG9hZCAwCglpdG9iCglleHRyYWN0IDcgMQoJbG9hZCAwCglpbnQgMQoJKwoJc3RvcmUgMAoJaW50IDc3CglpdG9iCglpbnQgODgKCWl0b2IKCWNvbmNhdAoJbG9hZCAwCglzd2FwCglzdG9yZXMKCWxvYWQgMAoJaXRvYgoJZXh0cmFjdCA3IDEKCWxvYWQgMAoJaW50IDEKCSsKCXN0b3JlIDAKCWNvbmNhdAoJbG9hZCAwCglzd2FwCglzdG9yZXMKCWxvYWQgMAoJaXRvYgoJZXh0cmFjdCA3IDEKCWxvYWQgMAoJaW50IDEKCSsKCXN0b3JlIDAKCWNvbmNhdAoJbG9hZCAwCglzd2FwCglzdG9yZXMKCWxvYWQgMAoJaXRvYgoJZXh0cmFjdCA3IDEKCWxvYWQgMAoJaW50IDEKCSsKCXN0b3JlIDAKCWZyYW1lX2J1cnkgLTEgLy8gYzogdWludDY0W11bXVtdCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czoyOAoJLy8gaSA9IDEgKyAwCglpbnQgMQoJaW50IDAKCSsKCWZyYW1lX2J1cnkgLTIgLy8gaTogdWludDY0CgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czozMAoJLy8gYXNzZXJ0KGNbaV1baV1baV0gPT09IDg4KQoJZnJhbWVfZGlnIC0xIC8vIGM6IHVpbnQ2NFtdW11bXQoJYnRvaQoJbG9hZHMKCWZyYW1lX2RpZyAtMiAvLyBpOiB1aW50NjQKCWludCAxCglleHRyYWN0MwoJYnRvaQoJbG9hZHMKCWZyYW1lX2RpZyAtMiAvLyBpOiB1aW50NjQKCWludCAxCglleHRyYWN0MwoJYnRvaQoJbG9hZHMKCWludCA4CglmcmFtZV9kaWcgLTIgLy8gaTogdWludDY0CgkqCglpbnQgOAoJZXh0cmFjdDMKCWJ0b2kKCWludCA4OAoJPT0KCWFzc2VydAoJcmV0c3ViCgphYmlfcm91dGVfc2V0QXJyYXlWYWx1ZToKCXR4biBPbkNvbXBsZXRpb24KCWludCBOb09wCgk9PQoJYXNzZXJ0CglieXRlIDB4CglkdXBuIDIKCWNhbGxzdWIgc2V0QXJyYXlWYWx1ZQoJaW50IDEKCXJldHVybgoKc2V0QXJyYXlWYWx1ZToKCXByb3RvIDIgMAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6MzQKCS8vIGM6IHVpbnQ2NFtdID0gWzEsIDIsIDMsIDQsIDVdCglpbnQgMQoJaXRvYgoJaW50IDIKCWl0b2IKCWNvbmNhdAoJaW50IDMKCWl0b2IKCWNvbmNhdAoJaW50IDQKCWl0b2IKCWNvbmNhdAoJaW50IDUKCWl0b2IKCWNvbmNhdAoJbG9hZCAwCglzd2FwCglzdG9yZXMKCWxvYWQgMAoJaXRvYgoJZXh0cmFjdCA3IDEKCWxvYWQgMAoJaW50IDEKCSsKCXN0b3JlIDAKCWZyYW1lX2J1cnkgLTEgLy8gYzogdWludDY0W10KCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjM2CgkvLyBjWzFdID0gMjIKCWZyYW1lX2RpZyAtMSAvLyBjOiB1aW50NjRbXQoJYnRvaQoJZHVwCglsb2FkcwoJaW50IDEKCWludCA4CgkqCglpbnQgMjIKCWl0b2IKCXJlcGxhY2UzCglzdG9yZXMKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjM4CgkvLyBhc3NlcnQoY1sxXSA9PT0gMjIpCglmcmFtZV9kaWcgLTEgLy8gYzogdWludDY0W10KCWJ0b2kKCWxvYWRzCglleHRyYWN0IDggOAoJYnRvaQoJaW50IDIyCgk9PQoJYXNzZXJ0CglyZXRzdWIKCmFiaV9yb3V0ZV9zZXROZXN0ZWRBcnJheVZhbHVlOgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCWJ5dGUgMHgKCWR1cG4gMwoJY2FsbHN1YiBzZXROZXN0ZWRBcnJheVZhbHVlCglpbnQgMQoJcmV0dXJuCgpzZXROZXN0ZWRBcnJheVZhbHVlOgoJcHJvdG8gMyAwCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo0MgoJLy8gYzogdWludDY0W11bXSA9IFtbMSwgMl0sIFszLCA0XV0KCWludCAxCglpdG9iCglpbnQgMgoJaXRvYgoJY29uY2F0Cglsb2FkIDAKCXN3YXAKCXN0b3JlcwoJbG9hZCAwCglpdG9iCglleHRyYWN0IDcgMQoJbG9hZCAwCglpbnQgMQoJKwoJc3RvcmUgMAoJaW50IDMKCWl0b2IKCWludCA0CglpdG9iCgljb25jYXQKCWxvYWQgMAoJc3dhcAoJc3RvcmVzCglsb2FkIDAKCWl0b2IKCWV4dHJhY3QgNyAxCglsb2FkIDAKCWludCAxCgkrCglzdG9yZSAwCgljb25jYXQKCWxvYWQgMAoJc3dhcAoJc3RvcmVzCglsb2FkIDAKCWl0b2IKCWV4dHJhY3QgNyAxCglsb2FkIDAKCWludCAxCgkrCglzdG9yZSAwCglmcmFtZV9idXJ5IC0xIC8vIGM6IHVpbnQ2NFtdW10KCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjQzCgkvLyBpID0gMQoJaW50IDEKCWZyYW1lX2J1cnkgLTIgLy8gaTogdWludDY0CgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo0NQoJLy8gY1tpXVtpXSA9IDQ0CglmcmFtZV9kaWcgLTEgLy8gYzogdWludDY0W11bXQoJYnRvaQoJbG9hZHMKCWZyYW1lX2RpZyAtMiAvLyBpOiB1aW50NjQKCWludCAxCglleHRyYWN0MwoJYnRvaQoJZHVwCglsb2FkcwoJZnJhbWVfZGlnIC0yIC8vIGk6IHVpbnQ2NAoJaW50IDgKCSoKCWludCA0NAoJaXRvYgoJcmVwbGFjZTMKCXN0b3JlcwoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6NDcKCS8vIGFzc2VydChjW2ldW2ldID09PSA0NCkKCWZyYW1lX2RpZyAtMSAvLyBjOiB1aW50NjRbXVtdCglidG9pCglsb2FkcwoJZnJhbWVfZGlnIC0yIC8vIGk6IHVpbnQ2NAoJaW50IDEKCWV4dHJhY3QzCglidG9pCglsb2FkcwoJaW50IDgKCWZyYW1lX2RpZyAtMiAvLyBpOiB1aW50NjQKCSoKCWludCA4CglleHRyYWN0MwoJYnRvaQoJaW50IDQ0Cgk9PQoJYXNzZXJ0CglyZXRzdWIKCmFiaV9yb3V0ZV9zdHJpbmdBcnJheToKCXR4biBPbkNvbXBsZXRpb24KCWludCBOb09wCgk9PQoJYXNzZXJ0CglieXRlIDB4CglkdXBuIDIKCWNhbGxzdWIgc3RyaW5nQXJyYXkKCWludCAxCglyZXR1cm4KCnN0cmluZ0FycmF5OgoJcHJvdG8gMiAwCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo1MQoJLy8gYzogc3RyaW5nW10gPSBbJ2hlbGxvJywgJ3dvcmxkJywgJ3Rlc3QnLCAnMTIzJ10KCWJ5dGUgImhlbGxvIgoJYnl0ZSAid29ybGQiCglieXRlICJ0ZXN0IgoJYnl0ZSAiMTIzIgoJbG9hZCAwCglzd2FwCglzdG9yZXMKCWxvYWQgMAoJaXRvYgoJZXh0cmFjdCA3IDEKCWxvYWQgMAoJaW50IDEKCSsKCXN0b3JlIDAKCXN3YXAKCWxvYWQgMAoJc3dhcAoJc3RvcmVzCglsb2FkIDAKCWl0b2IKCWV4dHJhY3QgNyAxCglsb2FkIDAKCWludCAxCgkrCglzdG9yZSAwCglzd2FwCgljb25jYXQKCXN3YXAKCWxvYWQgMAoJc3dhcAoJc3RvcmVzCglsb2FkIDAKCWl0b2IKCWV4dHJhY3QgNyAxCglsb2FkIDAKCWludCAxCgkrCglzdG9yZSAwCglzd2FwCgljb25jYXQKCXN3YXAKCWxvYWQgMAoJc3dhcAoJc3RvcmVzCglsb2FkIDAKCWl0b2IKCWV4dHJhY3QgNyAxCglsb2FkIDAKCWludCAxCgkrCglzdG9yZSAwCglzd2FwCgljb25jYXQKCWxvYWQgMAoJc3dhcAoJc3RvcmVzCglsb2FkIDAKCWl0b2IKCWV4dHJhY3QgNyAxCglsb2FkIDAKCWludCAxCgkrCglzdG9yZSAwCglmcmFtZV9idXJ5IC0xIC8vIGM6IGJ5dGVzW10KCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjUzCgkvLyByZXR1cm4gY1syXTsKCWZyYW1lX2RpZyAtMSAvLyBjOiBieXRlc1tdCglidG9pCglsb2FkcwoJZXh0cmFjdCAyIDEKCWJ0b2kKCWxvYWRzCglkdXAKCWxlbgoJaXRvYgoJZXh0cmFjdCA2IDAKCXN3YXAKCWNvbmNhdAoJYnl0ZSAweDE1MWY3Yzc1Cglzd2FwCgljb25jYXQKCWxvZwoJcmV0c3ViCgphYmlfcm91dGVfc2V0TmVzdGVkQXJyYXk6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJYnl0ZSAweAoJZHVwbiAyCgljYWxsc3ViIHNldE5lc3RlZEFycmF5CglpbnQgMQoJcmV0dXJuCgpzZXROZXN0ZWRBcnJheToKCXByb3RvIDIgMAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6NTcKCS8vIGM6IHVpbnQ2NFtdW10gPSBbWzEsIDJdLCBbMywgNF1dCglpbnQgMQoJaXRvYgoJaW50IDIKCWl0b2IKCWNvbmNhdAoJbG9hZCAwCglzd2FwCglzdG9yZXMKCWxvYWQgMAoJaXRvYgoJZXh0cmFjdCA3IDEKCWxvYWQgMAoJaW50IDEKCSsKCXN0b3JlIDAKCWludCAzCglpdG9iCglpbnQgNAoJaXRvYgoJY29uY2F0Cglsb2FkIDAKCXN3YXAKCXN0b3JlcwoJbG9hZCAwCglpdG9iCglleHRyYWN0IDcgMQoJbG9hZCAwCglpbnQgMQoJKwoJc3RvcmUgMAoJY29uY2F0Cglsb2FkIDAKCXN3YXAKCXN0b3JlcwoJbG9hZCAwCglpdG9iCglleHRyYWN0IDcgMQoJbG9hZCAwCglpbnQgMQoJKwoJc3RvcmUgMAoJZnJhbWVfYnVyeSAtMSAvLyBjOiB1aW50NjRbXVtdCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo1OQoJLy8gY1sxXSA9IFszMywgNDRdCglmcmFtZV9kaWcgLTEgLy8gYzogdWludDY0W11bXQoJYnRvaQoJbG9hZHMKCWV4dHJhY3QgMSAxCglidG9pCglpbnQgMzMKCWl0b2IKCWludCA0NAoJaXRvYgoJY29uY2F0Cglsb2FkIDAKCXN3YXAKCXN0b3JlcwoJbG9hZCAwCglpdG9iCglleHRyYWN0IDcgMQoJbG9hZCAwCglpbnQgMQoJKwoJc3RvcmUgMAoJYnRvaQoJbG9hZHMKCXN0b3JlcwoJbG9hZCAwCglpbnQgMQoJLQoJc3RvcmUgMAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6NjEKCS8vIHJldHVybiBjWzFdWzFdOwoJZnJhbWVfZGlnIC0xIC8vIGM6IHVpbnQ2NFtdW10KCWJ0b2kKCWxvYWRzCglleHRyYWN0IDEgMQoJYnRvaQoJbG9hZHMKCWV4dHJhY3QgOCA4CglidG9pCglpdG9iCglieXRlIDB4MTUxZjdjNzUKCXN3YXAKCWNvbmNhdAoJbG9nCglyZXRzdWIKCmFiaV9yb3V0ZV9zZXRNdWx0aU5lc3RlZEFycmF5OgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCWJ5dGUgMHgKCWR1cG4gMgoJY2FsbHN1YiBzZXRNdWx0aU5lc3RlZEFycmF5CglpbnQgMQoJcmV0dXJuCgpzZXRNdWx0aU5lc3RlZEFycmF5OgoJcHJvdG8gMiAwCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo2NQoJLy8gYzogdWludDY0W11bXVtdID0gW1tbMSwgMl0sIFszLCA0XV0sIFtbNSwgNl0sIFs3LCA4XV1dCglpbnQgMQoJaXRvYgoJaW50IDIKCWl0b2IKCWNvbmNhdAoJbG9hZCAwCglzd2FwCglzdG9yZXMKCWxvYWQgMAoJaXRvYgoJZXh0cmFjdCA3IDEKCWxvYWQgMAoJaW50IDEKCSsKCXN0b3JlIDAKCWludCAzCglpdG9iCglpbnQgNAoJaXRvYgoJY29uY2F0Cglsb2FkIDAKCXN3YXAKCXN0b3JlcwoJbG9hZCAwCglpdG9iCglleHRyYWN0IDcgMQoJbG9hZCAwCglpbnQgMQoJKwoJc3RvcmUgMAoJY29uY2F0Cglsb2FkIDAKCXN3YXAKCXN0b3JlcwoJbG9hZCAwCglpdG9iCglleHRyYWN0IDcgMQoJbG9hZCAwCglpbnQgMQoJKwoJc3RvcmUgMAoJaW50IDUKCWl0b2IKCWludCA2CglpdG9iCgljb25jYXQKCWxvYWQgMAoJc3dhcAoJc3RvcmVzCglsb2FkIDAKCWl0b2IKCWV4dHJhY3QgNyAxCglsb2FkIDAKCWludCAxCgkrCglzdG9yZSAwCglpbnQgNwoJaXRvYgoJaW50IDgKCWl0b2IKCWNvbmNhdAoJbG9hZCAwCglzd2FwCglzdG9yZXMKCWxvYWQgMAoJaXRvYgoJZXh0cmFjdCA3IDEKCWxvYWQgMAoJaW50IDEKCSsKCXN0b3JlIDAKCWNvbmNhdAoJbG9hZCAwCglzd2FwCglzdG9yZXMKCWxvYWQgMAoJaXRvYgoJZXh0cmFjdCA3IDEKCWxvYWQgMAoJaW50IDEKCSsKCXN0b3JlIDAKCWNvbmNhdAoJbG9hZCAwCglzd2FwCglzdG9yZXMKCWxvYWQgMAoJaXRvYgoJZXh0cmFjdCA3IDEKCWxvYWQgMAoJaW50IDEKCSsKCXN0b3JlIDAKCWZyYW1lX2J1cnkgLTEgLy8gYzogdWludDY0W11bXVtdCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo2NwoJLy8gY1sxXSA9IFtbNTUsIDY2XSwgWzc3LCA4OF1dCglmcmFtZV9kaWcgLTEgLy8gYzogdWludDY0W11bXVtdCglidG9pCglsb2FkcwoJZXh0cmFjdCAxIDEKCWJ0b2kKCWludCA1NQoJaXRvYgoJaW50IDY2CglpdG9iCgljb25jYXQKCWxvYWQgMAoJc3dhcAoJc3RvcmVzCglsb2FkIDAKCWl0b2IKCWV4dHJhY3QgNyAxCglsb2FkIDAKCWludCAxCgkrCglzdG9yZSAwCglpbnQgNzcKCWl0b2IKCWludCA4OAoJaXRvYgoJY29uY2F0Cglsb2FkIDAKCXN3YXAKCXN0b3JlcwoJbG9hZCAwCglpdG9iCglleHRyYWN0IDcgMQoJbG9hZCAwCglpbnQgMQoJKwoJc3RvcmUgMAoJY29uY2F0Cglsb2FkIDAKCXN3YXAKCXN0b3JlcwoJbG9hZCAwCglpdG9iCglleHRyYWN0IDcgMQoJbG9hZCAwCglpbnQgMQoJKwoJc3RvcmUgMAoJYnRvaQoJbG9hZHMKCXN0b3JlcwoJbG9hZCAwCglpbnQgMQoJLQoJc3RvcmUgMAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6NjkKCS8vIHJldHVybiBjWzFdWzFdWzFdOwoJZnJhbWVfZGlnIC0xIC8vIGM6IHVpbnQ2NFtdW11bXQoJYnRvaQoJbG9hZHMKCWV4dHJhY3QgMSAxCglidG9pCglsb2FkcwoJZXh0cmFjdCAxIDEKCWJ0b2kKCWxvYWRzCglleHRyYWN0IDggOAoJYnRvaQoJaXRvYgoJYnl0ZSAweDE1MWY3Yzc1Cglzd2FwCgljb25jYXQKCWxvZwoJcmV0c3ViCgphYmlfcm91dGVfYWNjb3VudEFycmF5OgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCWJ5dGUgMHgKCWR1cG4gMgoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMwoJYnRvaQoJdHhuYXMgQWNjb3VudHMKCXR4bmEgQXBwbGljYXRpb25BcmdzIDIKCWJ0b2kKCXR4bmFzIEFjY291bnRzCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAxCglidG9pCgl0eG5hcyBBY2NvdW50cwoJY2FsbHN1YiBhY2NvdW50QXJyYXkKCWludCAxCglyZXR1cm4KCmFjY291bnRBcnJheToKCXByb3RvIDUgMAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6NzMKCS8vIGFyciA9IFthLCBiLCBjXQoJZnJhbWVfZGlnIC0xIC8vIGE6IEFjY291bnQKCWZyYW1lX2RpZyAtMiAvLyBiOiBBY2NvdW50Cgljb25jYXQKCWZyYW1lX2RpZyAtMyAvLyBjOiBBY2NvdW50Cgljb25jYXQKCWxvYWQgMAoJc3dhcAoJc3RvcmVzCglsb2FkIDAKCWl0b2IKCWV4dHJhY3QgNyAxCglsb2FkIDAKCWludCAxCgkrCglzdG9yZSAwCglmcmFtZV9idXJ5IC00IC8vIGFycjogQWNjb3VudFtdCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo3NQoJLy8gcmV0dXJuIGFyclsxXTsKCWZyYW1lX2RpZyAtNCAvLyBhcnI6IEFjY291bnRbXQoJYnRvaQoJbG9hZHMKCWV4dHJhY3QgMzIgMzIKCWJ5dGUgMHgxNTFmN2M3NQoJc3dhcAoJY29uY2F0Cglsb2cKCXJldHN1YgoKYWJpX3JvdXRlX2Fzc2V0QXJyYXk6Cgl0eG4gT25Db21wbGV0aW9uCglpbnQgTm9PcAoJPT0KCWFzc2VydAoJYnl0ZSAweAoJZHVwbiAyCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAzCglidG9pCgl0eG5hcyBBc3NldHMKCXR4bmEgQXBwbGljYXRpb25BcmdzIDIKCWJ0b2kKCXR4bmFzIEFzc2V0cwoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMQoJYnRvaQoJdHhuYXMgQXNzZXRzCgljYWxsc3ViIGFzc2V0QXJyYXkKCWludCAxCglyZXR1cm4KCmFzc2V0QXJyYXk6Cglwcm90byA1IDAKCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjc5CgkvLyBhcnIgPSBbYSwgYiwgY10KCWZyYW1lX2RpZyAtMSAvLyBhOiBBc3NldAoJaXRvYgoJZnJhbWVfZGlnIC0yIC8vIGI6IEFzc2V0CglpdG9iCgljb25jYXQKCWZyYW1lX2RpZyAtMyAvLyBjOiBBc3NldAoJaXRvYgoJY29uY2F0Cglsb2FkIDAKCXN3YXAKCXN0b3JlcwoJbG9hZCAwCglpdG9iCglleHRyYWN0IDcgMQoJbG9hZCAwCglpbnQgMQoJKwoJc3RvcmUgMAoJZnJhbWVfYnVyeSAtNCAvLyBhcnI6IEFzc2V0W10KCgkvLyB0ZXN0cy9jb250cmFjdHMvYWJpLnRzOjgxCgkvLyByZXR1cm4gYXJyWzFdOwoJZnJhbWVfZGlnIC00IC8vIGFycjogQXNzZXRbXQoJYnRvaQoJbG9hZHMKCWV4dHJhY3QgOCA4CglidG9pCglpdG9iCglieXRlIDB4MTUxZjdjNzUKCXN3YXAKCWNvbmNhdAoJbG9nCglyZXRzdWIKCmFiaV9yb3V0ZV9hcHBBcnJheToKCXR4biBPbkNvbXBsZXRpb24KCWludCBOb09wCgk9PQoJYXNzZXJ0CglieXRlIDB4CglkdXBuIDIKCXR4bmEgQXBwbGljYXRpb25BcmdzIDMKCWJ0b2kKCXR4bmFzIEFwcGxpY2F0aW9ucwoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMgoJYnRvaQoJdHhuYXMgQXBwbGljYXRpb25zCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAxCglidG9pCgl0eG5hcyBBcHBsaWNhdGlvbnMKCWNhbGxzdWIgYXBwQXJyYXkKCWludCAxCglyZXR1cm4KCmFwcEFycmF5OgoJcHJvdG8gNSAwCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo4NQoJLy8gYXJyID0gW2EsIGIsIGNdCglmcmFtZV9kaWcgLTEgLy8gYTogQXBwbGljYXRpb24KCWl0b2IKCWZyYW1lX2RpZyAtMiAvLyBiOiBBcHBsaWNhdGlvbgoJaXRvYgoJY29uY2F0CglmcmFtZV9kaWcgLTMgLy8gYzogQXBwbGljYXRpb24KCWl0b2IKCWNvbmNhdAoJbG9hZCAwCglzd2FwCglzdG9yZXMKCWxvYWQgMAoJaXRvYgoJZXh0cmFjdCA3IDEKCWxvYWQgMAoJaW50IDEKCSsKCXN0b3JlIDAKCWZyYW1lX2J1cnkgLTQgLy8gYXJyOiBBcHBsaWNhdGlvbltdCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo4NwoJLy8gcmV0dXJuIGFyclsxXTsKCWZyYW1lX2RpZyAtNCAvLyBhcnI6IEFwcGxpY2F0aW9uW10KCWJ0b2kKCWxvYWRzCglleHRyYWN0IDggOAoJYnRvaQoJaXRvYgoJYnl0ZSAweDE1MWY3Yzc1Cglzd2FwCgljb25jYXQKCWxvZwoJcmV0c3ViCgphYmlfcm91dGVfdWludDI1NkFycmF5OgoJdHhuIE9uQ29tcGxldGlvbgoJaW50IE5vT3AKCT09Cglhc3NlcnQKCWJ5dGUgMHgKCWR1cG4gMgoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMwoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMgoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMQoJY2FsbHN1YiB1aW50MjU2QXJyYXkKCWludCAxCglyZXR1cm4KCnVpbnQyNTZBcnJheToKCXByb3RvIDUgMAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6OTEKCS8vIGFyciA9IFthLCBiLCBjXQoJZnJhbWVfZGlnIC0xIC8vIGE6IHVpbnQyNTYKCWZyYW1lX2RpZyAtMiAvLyBiOiB1aW50MjU2Cgljb25jYXQKCWZyYW1lX2RpZyAtMyAvLyBjOiB1aW50MjU2Cgljb25jYXQKCWxvYWQgMAoJc3dhcAoJc3RvcmVzCglsb2FkIDAKCWl0b2IKCWV4dHJhY3QgNyAxCglsb2FkIDAKCWludCAxCgkrCglzdG9yZSAwCglmcmFtZV9idXJ5IC00IC8vIGFycjogdWludDI1NltdCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo5MwoJLy8gcmV0dXJuIGFyclsxXTsKCWZyYW1lX2RpZyAtNCAvLyBhcnI6IHVpbnQyNTZbXQoJYnRvaQoJbG9hZHMKCWV4dHJhY3QgMzIgMzIKCWJ5dGUgMHhGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGRkZGCgliJgoJYnl0ZSAweDE1MWY3Yzc1Cglzd2FwCgljb25jYXQKCWxvZwoJcmV0c3ViCgphYmlfcm91dGVfbmVzdGVkQXJyYXlWYXJpYWJsZToKCXR4biBPbkNvbXBsZXRpb24KCWludCBOb09wCgk9PQoJYXNzZXJ0CglieXRlIDB4CglkdXBuIDMKCWNhbGxzdWIgbmVzdGVkQXJyYXlWYXJpYWJsZQoJaW50IDEKCXJldHVybgoKbmVzdGVkQXJyYXlWYXJpYWJsZToKCXByb3RvIDMgMAoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6OTcKCS8vIGExID0gWzMsIDQsIDVdCglpbnQgMwoJaXRvYgoJaW50IDQKCWl0b2IKCWNvbmNhdAoJaW50IDUKCWl0b2IKCWNvbmNhdAoJbG9hZCAwCglzd2FwCglzdG9yZXMKCWxvYWQgMAoJaXRvYgoJZXh0cmFjdCA3IDEKCWxvYWQgMAoJaW50IDEKCSsKCXN0b3JlIDAKCWZyYW1lX2J1cnkgLTEgLy8gYTE6IHVpbnQ2NFtdCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czo5OAoJLy8gYTIgPSBbWzEsIDIsIDNdLCBhMV0KCWludCAxCglpdG9iCglpbnQgMgoJaXRvYgoJY29uY2F0CglpbnQgMwoJaXRvYgoJY29uY2F0Cglsb2FkIDAKCXN3YXAKCXN0b3JlcwoJbG9hZCAwCglpdG9iCglleHRyYWN0IDcgMQoJbG9hZCAwCglpbnQgMQoJKwoJc3RvcmUgMAoJZnJhbWVfZGlnIC0xIC8vIGExOiB1aW50NjRbXQoJY29uY2F0Cglsb2FkIDAKCXN3YXAKCXN0b3JlcwoJbG9hZCAwCglpdG9iCglleHRyYWN0IDcgMQoJbG9hZCAwCglpbnQgMQoJKwoJc3RvcmUgMAoJZnJhbWVfYnVyeSAtMiAvLyBhMjogdWludDY0W11bXQoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6MTAwCgkvLyByZXR1cm4gYTJbMV1bMV07CglmcmFtZV9kaWcgLTIgLy8gYTI6IHVpbnQ2NFtdW10KCWJ0b2kKCWxvYWRzCglleHRyYWN0IDEgMQoJYnRvaQoJbG9hZHMKCWV4dHJhY3QgOCA4CglidG9pCglpdG9iCglieXRlIDB4MTUxZjdjNzUKCXN3YXAKCWNvbmNhdAoJbG9nCglyZXRzdWIKCmFiaV9yb3V0ZV9zaW1wbGVUdXBsZToKCXR4biBPbkNvbXBsZXRpb24KCWludCBOb09wCgk9PQoJYXNzZXJ0CglieXRlIDB4CglkdXBuIDIKCWNhbGxzdWIgc2ltcGxlVHVwbGUKCWludCAxCglyZXR1cm4KCnNpbXBsZVR1cGxlOgoJcHJvdG8gMiAwCgoJLy8gdGVzdHMvY29udHJhY3RzL2FiaS50czoxMDQKCS8vIHQ6IFt1aW50OCwgdWludDY0LCB1aW50OF0gPSBbMTEgYXMgdWludDgsIDIyLCAzMyBhcyB1aW50OF0KCWludCAxMQoJaXRvYgoJZXh0cmFjdCA3IDAKCWludCAyMgoJaXRvYgoJY29uY2F0CglpbnQgMzMKCWl0b2IKCWV4dHJhY3QgNyAwCgljb25jYXQKCWxvYWQgMAoJc3dhcAoJc3RvcmVzCglsb2FkIDAKCWl0b2IKCWV4dHJhY3QgNyAxCglkdXAKCWxvYWQgMAoJaW50IDEKCSsKCXN0b3JlIDAKCWZyYW1lX2J1cnkgLTEgLy8gdDogW3VpbnQ4LCB1aW50NjQsIHVpbnQ4XQoKCS8vIHRlc3RzL2NvbnRyYWN0cy9hYmkudHM6MTA2CgkvLyByZXR1cm4gdFsyXTsKCWZyYW1lX2RpZyAtMSAvLyB0OiBbdWludDgsIHVpbnQ2NCwgdWludDhdCglidG9pCglsb2FkcwoJZXh0cmFjdCA5IDEKCWJ5dGUgMHhGRkZGRkZGRkZGRkZGRkZGCgliJgoJYnl0ZSAweDE1MWY3Yzc1Cglzd2FwCgljb25jYXQKCWxvZwoJcmV0c3ViCgptYWluOgoJaW50IDEKCXN0b3JlIDAKCXR4biBOdW1BcHBBcmdzCglibnogcm91dGVfYWJpCgl0eG4gQXBwbGljYXRpb25JRAoJaW50IDAKCT09CglpbnQgMQoJbWF0Y2ggYmFyZV9yb3V0ZV9jcmVhdGUKCnJvdXRlX2FiaToKCW1ldGhvZCAidmFyaWFibGVBcnJheSgpdm9pZCIKCW1ldGhvZCAidGhyZWVEaW1lbnNpb25hbEFycmF5KCl2b2lkIgoJbWV0aG9kICJub25MaXRlcmFsQWNjZXNzKCl2b2lkIgoJbWV0aG9kICJzZXRBcnJheVZhbHVlKCl2b2lkIgoJbWV0aG9kICJzZXROZXN0ZWRBcnJheVZhbHVlKCl2b2lkIgoJbWV0aG9kICJzdHJpbmdBcnJheSgpc3RyaW5nIgoJbWV0aG9kICJzZXROZXN0ZWRBcnJheSgpdWludDY0IgoJbWV0aG9kICJzZXRNdWx0aU5lc3RlZEFycmF5KCl1aW50NjQiCgltZXRob2QgImFjY291bnRBcnJheShhY2NvdW50LGFjY291bnQsYWNjb3VudClhZGRyZXNzIgoJbWV0aG9kICJhc3NldEFycmF5KGFzc2V0LGFzc2V0LGFzc2V0KXVpbnQ2NCIKCW1ldGhvZCAiYXBwQXJyYXkoYXBwbGljYXRpb24sYXBwbGljYXRpb24sYXBwbGljYXRpb24pdWludDY0IgoJbWV0aG9kICJ1aW50MjU2QXJyYXkodWludDI1Nix1aW50MjU2LHVpbnQyNTYpdWludDI1NiIKCW1ldGhvZCAibmVzdGVkQXJyYXlWYXJpYWJsZSgpdWludDY0IgoJbWV0aG9kICJzaW1wbGVUdXBsZSgpdWludDY0IgoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMAoJbWF0Y2ggYWJpX3JvdXRlX3ZhcmlhYmxlQXJyYXkgYWJpX3JvdXRlX3RocmVlRGltZW5zaW9uYWxBcnJheSBhYmlfcm91dGVfbm9uTGl0ZXJhbEFjY2VzcyBhYmlfcm91dGVfc2V0QXJyYXlWYWx1ZSBhYmlfcm91dGVfc2V0TmVzdGVkQXJyYXlWYWx1ZSBhYmlfcm91dGVfc3RyaW5nQXJyYXkgYWJpX3JvdXRlX3NldE5lc3RlZEFycmF5IGFiaV9yb3V0ZV9zZXRNdWx0aU5lc3RlZEFycmF5IGFiaV9yb3V0ZV9hY2NvdW50QXJyYXkgYWJpX3JvdXRlX2Fzc2V0QXJyYXkgYWJpX3JvdXRlX2FwcEFycmF5IGFiaV9yb3V0ZV91aW50MjU2QXJyYXkgYWJpX3JvdXRlX25lc3RlZEFycmF5VmFyaWFibGUgYWJpX3JvdXRlX3NpbXBsZVR1cGxl";
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
        new algosdk.ABIMethod({ name: "simpleTuple", desc: "", args: [], returns: { type: "uint64", desc: "" } })
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
        }
    };
}
