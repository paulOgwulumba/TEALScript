/* eslint-disable */
/**
 * This file was automatically generated by @algorandfoundation/algokit-client-generator.
 * DO NOT MODIFY IT BY HAND.
 * requires: @algorandfoundation/algokit-utils: ^2
 */
import * as algokit from '@algorandfoundation/algokit-utils'
import type {
  AppCallTransactionResult,
  AppCallTransactionResultOfType,
  CoreAppCallArgs,
  RawAppCallArgs,
  AppState,
  TealTemplateParams,
  ABIAppCallArg,
} from '@algorandfoundation/algokit-utils/types/app'
import type {
  AppClientCallCoreParams,
  AppClientCompilationParams,
  AppClientDeployCoreParams,
  AppDetails,
  ApplicationClient,
} from '@algorandfoundation/algokit-utils/types/app-client'
import type { AppSpec } from '@algorandfoundation/algokit-utils/types/app-spec'
import type { SendTransactionResult, TransactionToSign, SendTransactionFrom } from '@algorandfoundation/algokit-utils/types/transaction'
import type { TransactionWithSigner } from 'algosdk'
import { Algodv2, OnApplicationComplete, Transaction, AtomicTransactionComposer } from 'algosdk'
export const APP_SPEC: AppSpec = {
  "hints": {
    "deleteApplication()void": {
      "call_config": {
        "delete_application": "CALL"
      }
    },
    "createApplication()void": {
      "call_config": {
        "no_op": "CREATE"
      }
    },
    "verify(byte[],byte[33][3])void": {
      "call_config": {
        "no_op": "CALL"
      }
    },
    "appendLeaf(byte[],byte[33][3])void": {
      "call_config": {
        "no_op": "CALL"
      }
    },
    "updateLeaf(byte[],byte[],byte[33][3])void": {
      "call_config": {
        "no_op": "CALL"
      }
    }
  },
  "bare_call_config": {
    "no_op": "NEVER",
    "opt_in": "NEVER",
    "close_out": "NEVER",
    "update_application": "NEVER",
    "delete_application": "NEVER"
  },
  "schema": {
    "local": {
      "declared": {},
      "reserved": {}
    },
    "global": {
      "declared": {
        "root": {
          "type": "bytes",
          "key": "root"
        },
        "size": {
          "type": "uint64",
          "key": "size"
        }
      },
      "reserved": {}
    }
  },
  "state": {
    "global": {
      "num_byte_slices": 1,
      "num_uints": 1
    },
    "local": {
      "num_byte_slices": 0,
      "num_uints": 0
    }
  },
  "source": {
    "approval": "I3ByYWdtYSB2ZXJzaW9uIDkKCi8vIFRoaXMgVEVBTCB3YXMgZ2VuZXJhdGVkIGJ5IFRFQUxTY3JpcHQgdjAuNjUuMAovLyBodHRwczovL2dpdGh1Yi5jb20vYWxnb3JhbmRmb3VuZGF0aW9uL1RFQUxTY3JpcHQKCi8vIFRoaXMgY29udHJhY3QgaXMgY29tcGxpYW50IHdpdGggYW5kL29yIGltcGxlbWVudHMgdGhlIGZvbGxvd2luZyBBUkNzOiBbIEFSQzQgXQoKLy8gVGhlIGZvbGxvd2luZyB0ZW4gbGluZXMgb2YgVEVBTCBoYW5kbGUgaW5pdGlhbCBwcm9ncmFtIGZsb3cKLy8gVGhpcyBwYXR0ZXJuIGlzIHVzZWQgdG8gbWFrZSBpdCBlYXN5IGZvciBhbnlvbmUgdG8gcGFyc2UgdGhlIHN0YXJ0IG9mIHRoZSBwcm9ncmFtIGFuZCBkZXRlcm1pbmUgaWYgYSBzcGVjaWZpYyBhY3Rpb24gaXMgYWxsb3dlZAovLyBIZXJlLCBhY3Rpb24gcmVmZXJzIHRvIHRoZSBPbkNvbXBsZXRlIGluIGNvbWJpbmF0aW9uIHdpdGggd2hldGhlciB0aGUgYXBwIGlzIGJlaW5nIGNyZWF0ZWQgb3IgY2FsbGVkCi8vIEV2ZXJ5IHBvc3NpYmxlIGFjdGlvbiBmb3IgdGhpcyBjb250cmFjdCBpcyByZXByZXNlbnRlZCBpbiB0aGUgc3dpdGNoIHN0YXRlbWVudAovLyBJZiB0aGUgYWN0aW9uIGlzIG5vdCBpbXBsbWVudGVkIGluIHRoZSBjb250cmFjdCwgaXRzIHJlc3BlY3RpdmUgYnJhbmNoIHdpbGwgYmUgIk5PVF9JTVBMRU1FTlRFRCIgd2hpY2gganVzdCBjb250YWlucyAiZXJyIgp0eG4gQXBwbGljYXRpb25JRAppbnQgMAo+CmludCA2CioKdHhuIE9uQ29tcGxldGlvbgorCnN3aXRjaCBjcmVhdGVfTm9PcCBOT1RfSU1QTEVNRU5URUQgTk9UX0lNUExFTUVOVEVEIE5PVF9JTVBMRU1FTlRFRCBOT1RfSU1QTEVNRU5URUQgTk9UX0lNUExFTUVOVEVEIGNhbGxfTm9PcCBOT1RfSU1QTEVNRU5URUQgTk9UX0lNUExFTUVOVEVEIE5PVF9JTVBMRU1FTlRFRCBOT1RfSU1QTEVNRU5URUQgY2FsbF9EZWxldGVBcHBsaWNhdGlvbgoKTk9UX0lNUExFTUVOVEVEOgoJZXJyCgpjYWxjSW5pdFJvb3Q6CgkvLyBTZXR1cCB0aGUgZnJhbWUgZm9yIGFyZ3MgYW5kIHJldHVybiB2YWx1ZS4gVXNlIGVtcHR5IGJ5dGVzIHRvIGNyZWF0ZSBzcGFjZSBvbiB0aGUgc3RhY2sgZm9yIGxvY2FsIHZhcmlhYmxlcyBpZiBuZWNlc3NhcnkKCXByb3RvIDAgMTsgYnl0ZSAweDsgZHVwbiAxCgoJLy8gZXhhbXBsZXMvbWVya2xlL21lcmtsZS5hbGdvLnRzOjE5CgkvLyByZXN1bHQgPSBFTVBUWV9IQVNICgkvLyBleGFtcGxlcy9tZXJrbGUvbWVya2xlLmFsZ28udHM6NgoJLy8gaGV4KCdlM2IwYzQ0Mjk4ZmMxYzE0OWFmYmY0Yzg5OTZmYjkyNDI3YWU0MWU0NjQ5YjkzNGNhNDk1OTkxYjc4NTJiODU1JykKCWJ5dGUgMHhlM2IwYzQ0Mjk4ZmMxYzE0OWFmYmY0Yzg5OTZmYjkyNDI3YWU0MWU0NjQ5YjkzNGNhNDk1OTkxYjc4NTJiODU1MDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMAoJYnl0ZSAweAoJYnl0ZSAweAoJYj09Cglhc3NlcnQKCWV4dHJhY3QgMCAzMgoJZnJhbWVfYnVyeSAwIC8vIHJlc3VsdDogYnl0ZVszMl0KCgkvLyBleGFtcGxlcy9tZXJrbGUvbWVya2xlLmFsZ28udHM6MjEKCS8vIGkgPSAwCglpbnQgMAoJZnJhbWVfYnVyeSAxIC8vIGk6IHVpbnQ2NAoKZm9yXzA6CglmcmFtZV9kaWcgMSAvLyBpOiB1aW50NjQKCWludCAzCgk8CglieiBmb3JfMF9lbmQKCgkvLyBleGFtcGxlcy9tZXJrbGUvbWVya2xlLmFsZ28udHM6MjIKCS8vIHJlc3VsdCA9IHNoYTI1NihyZXN1bHQgKyByZXN1bHQpCglmcmFtZV9kaWcgMCAvLyByZXN1bHQ6IGJ5dGVbMzJdCglmcmFtZV9kaWcgMCAvLyByZXN1bHQ6IGJ5dGVbMzJdCgljb25jYXQKCXNoYTI1NgoJZnJhbWVfYnVyeSAwIC8vIHJlc3VsdDogYnl0ZVszMl0KCgkvLyBleGFtcGxlcy9tZXJrbGUvbWVya2xlLmFsZ28udHM6MjEKCS8vIGkgPSBpICsgMQoJZnJhbWVfZGlnIDEgLy8gaTogdWludDY0CglpbnQgMQoJKwoJZnJhbWVfYnVyeSAxIC8vIGk6IHVpbnQ2NAoJYiBmb3JfMAoKZm9yXzBfZW5kOgoJLy8gZXhhbXBsZXMvbWVya2xlL21lcmtsZS5hbGdvLnRzOjI1CgkvLyByZXR1cm4gcmVzdWx0OwoJZnJhbWVfZGlnIDAgLy8gcmVzdWx0OiBieXRlWzMyXQoKCS8vIHNldCB0aGUgc3Vicm91dGluZSByZXR1cm4gdmFsdWUKCWZyYW1lX2J1cnkgMAoKCS8vIHBvcCBhbGwgbG9jYWwgdmFyaWFibGVzIGZyb20gdGhlIHN0YWNrCglwb3BuIDEKCXJldHN1YgoKaGFzaENvbmNhdDoKCS8vIFNldHVwIHRoZSBmcmFtZSBmb3IgYXJncyBhbmQgcmV0dXJuIHZhbHVlLiBVc2UgZW1wdHkgYnl0ZXMgdG8gY3JlYXRlIHNwYWNlIG9uIHRoZSBzdGFjayBmb3IgbG9jYWwgdmFyaWFibGVzIGlmIG5lY2Vzc2FyeQoJcHJvdG8gMiAxCgoJLy8gZXhhbXBsZXMvbWVya2xlL21lcmtsZS5hbGdvLnRzOjI5CgkvLyByZXR1cm4gc2hhMjU2KGxlZnQgKyByaWdodCk7CglmcmFtZV9kaWcgLTEgLy8gbGVmdDogYnl0ZVszMl0KCWZyYW1lX2RpZyAtMiAvLyByaWdodDogYnl0ZVszMl0KCWNvbmNhdAoJc2hhMjU2CglyZXRzdWIKCmlzUmlnaHRTaWJsaW5nOgoJLy8gU2V0dXAgdGhlIGZyYW1lIGZvciBhcmdzIGFuZCByZXR1cm4gdmFsdWUuIFVzZSBlbXB0eSBieXRlcyB0byBjcmVhdGUgc3BhY2Ugb24gdGhlIHN0YWNrIGZvciBsb2NhbCB2YXJpYWJsZXMgaWYgbmVjZXNzYXJ5Cglwcm90byAxIDEKCgkvLyBleGFtcGxlcy9tZXJrbGUvbWVya2xlLmFsZ28udHM6MzMKCS8vIHJldHVybiBnZXRieXRlKGVsZW0sIDApID09PSBSSUdIVF9TSUJMSU5HX1BSRUZJWDsKCWZyYW1lX2RpZyAtMSAvLyBlbGVtOiBieXRlWzMzXQoJaW50IDAKCWdldGJ5dGUKCWludCAxNzAKCT09CglyZXRzdWIKCmNhbGNSb290OgoJLy8gU2V0dXAgdGhlIGZyYW1lIGZvciBhcmdzIGFuZCByZXR1cm4gdmFsdWUuIFVzZSBlbXB0eSBieXRlcyB0byBjcmVhdGUgc3BhY2Ugb24gdGhlIHN0YWNrIGZvciBsb2NhbCB2YXJpYWJsZXMgaWYgbmVjZXNzYXJ5Cglwcm90byAyIDE7IGJ5dGUgMHg7IGR1cG4gMQoKCS8vIGV4YW1wbGVzL21lcmtsZS9tZXJrbGUuYWxnby50czozOQoJLy8gaSA9IDAKCWludCAwCglmcmFtZV9idXJ5IDAgLy8gaTogdWludDY0Cgpmb3JfMToKCWZyYW1lX2RpZyAwIC8vIGk6IHVpbnQ2NAoJaW50IDMKCTwKCWJ6IGZvcl8xX2VuZAoJZnJhbWVfZGlnIDAgLy8gaTogdWludDY0CglmcmFtZV9idXJ5IDEgLy8gYWNjZXNzb3I6IGFjY2Vzc29yLy8wLy9lbGVtCgoJLy8gaWYwX2NvbmRpdGlvbgoJLy8gZXhhbXBsZXMvbWVya2xlL21lcmtsZS5hbGdvLnRzOjQyCgkvLyB0aGlzLmlzUmlnaHRTaWJsaW5nKGVsZW0pCglmcmFtZV9kaWcgLTIgLy8gcGF0aDogYnl0ZVszM11bM10KCXN0b3JlIDI1NSAvLyBmdWxsIGFycmF5CglpbnQgMCAvLyBpbml0aWFsIG9mZnNldAoJZnJhbWVfZGlnIDEgLy8gc2F2ZWQgYWNjZXNzb3I6IGFjY2Vzc29yLy8wLy9lbGVtCglpbnQgMzMKCSogLy8gYWNjICogdHlwZUxlbmd0aAoJKwoJbG9hZCAyNTUgLy8gZnVsbCBhcnJheQoJc3dhcAoJaW50IDMzCglleHRyYWN0MwoJY2FsbHN1YiBpc1JpZ2h0U2libGluZwoJYnogaWYwX2Vsc2UKCgkvLyBpZjBfY29uc2VxdWVudAoJLy8gZXhhbXBsZXMvbWVya2xlL21lcmtsZS5hbGdvLnRzOjQzCgkvLyByZXN1bHQgPSB0aGlzLmhhc2hDb25jYXQocmVzdWx0LCBleHRyYWN0MyhlbGVtLCAxLCAzMikpCglmcmFtZV9kaWcgLTIgLy8gcGF0aDogYnl0ZVszM11bM10KCXN0b3JlIDI1NSAvLyBmdWxsIGFycmF5CglpbnQgMCAvLyBpbml0aWFsIG9mZnNldAoJZnJhbWVfZGlnIDEgLy8gc2F2ZWQgYWNjZXNzb3I6IGFjY2Vzc29yLy8wLy9lbGVtCglpbnQgMzMKCSogLy8gYWNjICogdHlwZUxlbmd0aAoJKwoJbG9hZCAyNTUgLy8gZnVsbCBhcnJheQoJc3dhcAoJaW50IDMzCglleHRyYWN0MwoJZXh0cmFjdCAxIDMyCglmcmFtZV9kaWcgLTEgLy8gbGVhZjogYnl0ZVszMl0KCWNhbGxzdWIgaGFzaENvbmNhdAoJZnJhbWVfYnVyeSAtMSAvLyByZXN1bHQ6IGJ5dGVbMzJdCgliIGlmMF9lbmQKCmlmMF9lbHNlOgoJLy8gZXhhbXBsZXMvbWVya2xlL21lcmtsZS5hbGdvLnRzOjQ1CgkvLyByZXN1bHQgPSB0aGlzLmhhc2hDb25jYXQoZXh0cmFjdDMoZWxlbSwgMSwgMzIpLCByZXN1bHQpCglmcmFtZV9kaWcgLTEgLy8gbGVhZjogYnl0ZVszMl0KCWZyYW1lX2RpZyAtMiAvLyBwYXRoOiBieXRlWzMzXVszXQoJc3RvcmUgMjU1IC8vIGZ1bGwgYXJyYXkKCWludCAwIC8vIGluaXRpYWwgb2Zmc2V0CglmcmFtZV9kaWcgMSAvLyBzYXZlZCBhY2Nlc3NvcjogYWNjZXNzb3IvLzAvL2VsZW0KCWludCAzMwoJKiAvLyBhY2MgKiB0eXBlTGVuZ3RoCgkrCglsb2FkIDI1NSAvLyBmdWxsIGFycmF5Cglzd2FwCglpbnQgMzMKCWV4dHJhY3QzCglleHRyYWN0IDEgMzIKCWNhbGxzdWIgaGFzaENvbmNhdAoJZnJhbWVfYnVyeSAtMSAvLyByZXN1bHQ6IGJ5dGVbMzJdCgppZjBfZW5kOgoJLy8gZXhhbXBsZXMvbWVya2xlL21lcmtsZS5hbGdvLnRzOjM5CgkvLyBpID0gaSArIDEKCWZyYW1lX2RpZyAwIC8vIGk6IHVpbnQ2NAoJaW50IDEKCSsKCWZyYW1lX2J1cnkgMCAvLyBpOiB1aW50NjQKCWIgZm9yXzEKCmZvcl8xX2VuZDoKCS8vIGV4YW1wbGVzL21lcmtsZS9tZXJrbGUuYWxnby50czo0OQoJLy8gcmV0dXJuIHJlc3VsdDsKCWZyYW1lX2RpZyAtMSAvLyBsZWFmOiBieXRlWzMyXQoKCS8vIHNldCB0aGUgc3Vicm91dGluZSByZXR1cm4gdmFsdWUKCWZyYW1lX2J1cnkgMAoKCS8vIHBvcCBhbGwgbG9jYWwgdmFyaWFibGVzIGZyb20gdGhlIHN0YWNrCglwb3BuIDEKCXJldHN1YgoKLy8gZGVsZXRlQXBwbGljYXRpb24oKXZvaWQKYWJpX3JvdXRlX2RlbGV0ZUFwcGxpY2F0aW9uOgoJLy8gZXhlY3V0ZSBkZWxldGVBcHBsaWNhdGlvbigpdm9pZAoJY2FsbHN1YiBkZWxldGVBcHBsaWNhdGlvbgoJaW50IDEKCXJldHVybgoKZGVsZXRlQXBwbGljYXRpb246CgkvLyBTZXR1cCB0aGUgZnJhbWUgZm9yIGFyZ3MgYW5kIHJldHVybiB2YWx1ZS4gVXNlIGVtcHR5IGJ5dGVzIHRvIGNyZWF0ZSBzcGFjZSBvbiB0aGUgc3RhY2sgZm9yIGxvY2FsIHZhcmlhYmxlcyBpZiBuZWNlc3NhcnkKCXByb3RvIDAgMAoKCS8vIGV4YW1wbGVzL21lcmtsZS9tZXJrbGUuYWxnby50czo1MwoJLy8gdmVyaWZ5QXBwQ2FsbFR4bih0aGlzLnR4biwgeyBzZW5kZXI6IHRoaXMuYXBwLmNyZWF0b3IgfSkKCS8vIHZlcmlmeSBzZW5kZXIKCXR4biBTZW5kZXIKCXR4bmEgQXBwbGljYXRpb25zIDAKCWFwcF9wYXJhbXNfZ2V0IEFwcENyZWF0b3IKCWFzc2VydAoJPT0KCWFzc2VydAoJcmV0c3ViCgovLyBjcmVhdGVBcHBsaWNhdGlvbigpdm9pZAphYmlfcm91dGVfY3JlYXRlQXBwbGljYXRpb246CgkvLyBleGVjdXRlIGNyZWF0ZUFwcGxpY2F0aW9uKCl2b2lkCgljYWxsc3ViIGNyZWF0ZUFwcGxpY2F0aW9uCglpbnQgMQoJcmV0dXJuCgpjcmVhdGVBcHBsaWNhdGlvbjoKCS8vIFNldHVwIHRoZSBmcmFtZSBmb3IgYXJncyBhbmQgcmV0dXJuIHZhbHVlLiBVc2UgZW1wdHkgYnl0ZXMgdG8gY3JlYXRlIHNwYWNlIG9uIHRoZSBzdGFjayBmb3IgbG9jYWwgdmFyaWFibGVzIGlmIG5lY2Vzc2FyeQoJcHJvdG8gMCAwCgoJLy8gZXhhbXBsZXMvbWVya2xlL21lcmtsZS5hbGdvLnRzOjU3CgkvLyB0aGlzLnJvb3QudmFsdWUgPSB0aGlzLmNhbGNJbml0Um9vdCgpCglieXRlIDB4NzI2ZjZmNzQgLy8gInJvb3QiCgljYWxsc3ViIGNhbGNJbml0Um9vdAoJYXBwX2dsb2JhbF9wdXQKCXJldHN1YgoKLy8gdmVyaWZ5KGJ5dGVbMzNdWzNdLGJ5dGVzKXZvaWQKYWJpX3JvdXRlX3ZlcmlmeToKCS8vIHBhdGg6IGJ5dGVbMzNdWzNdCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAyCglkdXAKCWxlbgoJaW50IDk5Cgk9PQoJYXNzZXJ0CgoJLy8gZGF0YTogYnl0ZVtdCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAxCglleHRyYWN0IDIgMAoKCS8vIGV4ZWN1dGUgdmVyaWZ5KGJ5dGVbMzNdWzNdLGJ5dGVzKXZvaWQKCWNhbGxzdWIgdmVyaWZ5CglpbnQgMQoJcmV0dXJuCgp2ZXJpZnk6CgkvLyBTZXR1cCB0aGUgZnJhbWUgZm9yIGFyZ3MgYW5kIHJldHVybiB2YWx1ZS4gVXNlIGVtcHR5IGJ5dGVzIHRvIGNyZWF0ZSBzcGFjZSBvbiB0aGUgc3RhY2sgZm9yIGxvY2FsIHZhcmlhYmxlcyBpZiBuZWNlc3NhcnkKCXByb3RvIDIgMAoKCS8vIGV4YW1wbGVzL21lcmtsZS9tZXJrbGUuYWxnby50czo2MQoJLy8gYXNzZXJ0KHRoaXMucm9vdC52YWx1ZSA9PT0gdGhpcy5jYWxjUm9vdChzaGEyNTYoZGF0YSksIHBhdGgpKQoJYnl0ZSAweDcyNmY2Zjc0IC8vICJyb290IgoJYXBwX2dsb2JhbF9nZXQKCWZyYW1lX2RpZyAtMiAvLyBwYXRoOiBieXRlWzMzXVszXQoJZnJhbWVfZGlnIC0xIC8vIGRhdGE6IGJ5dGVzCglzaGEyNTYKCWNhbGxzdWIgY2FsY1Jvb3QKCT09Cglhc3NlcnQKCXJldHN1YgoKLy8gYXBwZW5kTGVhZihieXRlWzMzXVszXSxieXRlcyl2b2lkCmFiaV9yb3V0ZV9hcHBlbmRMZWFmOgoJLy8gcGF0aDogYnl0ZVszM11bM10KCXR4bmEgQXBwbGljYXRpb25BcmdzIDIKCWR1cAoJbGVuCglpbnQgOTkKCT09Cglhc3NlcnQKCgkvLyBkYXRhOiBieXRlW10KCXR4bmEgQXBwbGljYXRpb25BcmdzIDEKCWV4dHJhY3QgMiAwCgoJLy8gZXhlY3V0ZSBhcHBlbmRMZWFmKGJ5dGVbMzNdWzNdLGJ5dGVzKXZvaWQKCWNhbGxzdWIgYXBwZW5kTGVhZgoJaW50IDEKCXJldHVybgoKYXBwZW5kTGVhZjoKCS8vIFNldHVwIHRoZSBmcmFtZSBmb3IgYXJncyBhbmQgcmV0dXJuIHZhbHVlLiBVc2UgZW1wdHkgYnl0ZXMgdG8gY3JlYXRlIHNwYWNlIG9uIHRoZSBzdGFjayBmb3IgbG9jYWwgdmFyaWFibGVzIGlmIG5lY2Vzc2FyeQoJcHJvdG8gMiAwCgoJLy8gZXhhbXBsZXMvbWVya2xlL21lcmtsZS5hbGdvLnRzOjY1CgkvLyBhc3NlcnQoZGF0YSAhPT0gJycpCglmcmFtZV9kaWcgLTEgLy8gZGF0YTogYnl0ZXMKCWJ5dGUgMHggLy8gIiIKCSE9Cglhc3NlcnQKCgkvLyBleGFtcGxlcy9tZXJrbGUvbWVya2xlLmFsZ28udHM6NjYKCS8vIGFzc2VydCh0aGlzLnJvb3QudmFsdWUgPT09IHRoaXMuY2FsY1Jvb3QoRU1QVFlfSEFTSCwgcGF0aCkpCglieXRlIDB4NzI2ZjZmNzQgLy8gInJvb3QiCglhcHBfZ2xvYmFsX2dldAoJZnJhbWVfZGlnIC0yIC8vIHBhdGg6IGJ5dGVbMzNdWzNdCgoJLy8gZXhhbXBsZXMvbWVya2xlL21lcmtsZS5hbGdvLnRzOjYKCS8vIGhleCgnZTNiMGM0NDI5OGZjMWMxNDlhZmJmNGM4OTk2ZmI5MjQyN2FlNDFlNDY0OWI5MzRjYTQ5NTk5MWI3ODUyYjg1NScpCglieXRlIDB4ZTNiMGM0NDI5OGZjMWMxNDlhZmJmNGM4OTk2ZmI5MjQyN2FlNDFlNDY0OWI5MzRjYTQ5NTk5MWI3ODUyYjg1NTAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAKCWJ5dGUgMHgKCWJ5dGUgMHgKCWI9PQoJYXNzZXJ0CglleHRyYWN0IDAgMzIKCWNhbGxzdWIgY2FsY1Jvb3QKCT09Cglhc3NlcnQKCgkvLyBleGFtcGxlcy9tZXJrbGUvbWVya2xlLmFsZ28udHM6NjgKCS8vIHRoaXMucm9vdC52YWx1ZSA9IHRoaXMuY2FsY1Jvb3Qoc2hhMjU2KGRhdGEpLCBwYXRoKQoJYnl0ZSAweDcyNmY2Zjc0IC8vICJyb290IgoJZnJhbWVfZGlnIC0yIC8vIHBhdGg6IGJ5dGVbMzNdWzNdCglmcmFtZV9kaWcgLTEgLy8gZGF0YTogYnl0ZXMKCXNoYTI1NgoJY2FsbHN1YiBjYWxjUm9vdAoJYXBwX2dsb2JhbF9wdXQKCgkvLyBleGFtcGxlcy9tZXJrbGUvbWVya2xlLmFsZ28udHM6NzAKCS8vIHRoaXMuc2l6ZS52YWx1ZSA9IHRoaXMuc2l6ZS52YWx1ZSArIDEKCWJ5dGUgMHg3MzY5N2E2NSAvLyAic2l6ZSIKCWJ5dGUgMHg3MzY5N2E2NSAvLyAic2l6ZSIKCWFwcF9nbG9iYWxfZ2V0CglpbnQgMQoJKwoJYXBwX2dsb2JhbF9wdXQKCXJldHN1YgoKLy8gdXBkYXRlTGVhZihieXRlWzMzXVszXSxieXRlcyxieXRlcyl2b2lkCmFiaV9yb3V0ZV91cGRhdGVMZWFmOgoJLy8gcGF0aDogYnl0ZVszM11bM10KCXR4bmEgQXBwbGljYXRpb25BcmdzIDMKCWR1cAoJbGVuCglpbnQgOTkKCT09Cglhc3NlcnQKCgkvLyBuZXdEYXRhOiBieXRlW10KCXR4bmEgQXBwbGljYXRpb25BcmdzIDIKCWV4dHJhY3QgMiAwCgoJLy8gb2xkRGF0YTogYnl0ZVtdCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAxCglleHRyYWN0IDIgMAoKCS8vIGV4ZWN1dGUgdXBkYXRlTGVhZihieXRlWzMzXVszXSxieXRlcyxieXRlcyl2b2lkCgljYWxsc3ViIHVwZGF0ZUxlYWYKCWludCAxCglyZXR1cm4KCnVwZGF0ZUxlYWY6CgkvLyBTZXR1cCB0aGUgZnJhbWUgZm9yIGFyZ3MgYW5kIHJldHVybiB2YWx1ZS4gVXNlIGVtcHR5IGJ5dGVzIHRvIGNyZWF0ZSBzcGFjZSBvbiB0aGUgc3RhY2sgZm9yIGxvY2FsIHZhcmlhYmxlcyBpZiBuZWNlc3NhcnkKCXByb3RvIDMgMAoKCS8vIGV4YW1wbGVzL21lcmtsZS9tZXJrbGUuYWxnby50czo3NAoJLy8gYXNzZXJ0KG5ld0RhdGEgIT09ICcnKQoJZnJhbWVfZGlnIC0yIC8vIG5ld0RhdGE6IGJ5dGVzCglieXRlIDB4IC8vICIiCgkhPQoJYXNzZXJ0CgoJLy8gZXhhbXBsZXMvbWVya2xlL21lcmtsZS5hbGdvLnRzOjc1CgkvLyBhc3NlcnQodGhpcy5yb290LnZhbHVlID09PSB0aGlzLmNhbGNSb290KHNoYTI1NihvbGREYXRhKSwgcGF0aCkpCglieXRlIDB4NzI2ZjZmNzQgLy8gInJvb3QiCglhcHBfZ2xvYmFsX2dldAoJZnJhbWVfZGlnIC0zIC8vIHBhdGg6IGJ5dGVbMzNdWzNdCglmcmFtZV9kaWcgLTEgLy8gb2xkRGF0YTogYnl0ZXMKCXNoYTI1NgoJY2FsbHN1YiBjYWxjUm9vdAoJPT0KCWFzc2VydAoKCS8vIGV4YW1wbGVzL21lcmtsZS9tZXJrbGUuYWxnby50czo3NwoJLy8gdGhpcy5yb290LnZhbHVlID0gdGhpcy5jYWxjUm9vdChzaGEyNTYobmV3RGF0YSksIHBhdGgpCglieXRlIDB4NzI2ZjZmNzQgLy8gInJvb3QiCglmcmFtZV9kaWcgLTMgLy8gcGF0aDogYnl0ZVszM11bM10KCWZyYW1lX2RpZyAtMiAvLyBuZXdEYXRhOiBieXRlcwoJc2hhMjU2CgljYWxsc3ViIGNhbGNSb290CglhcHBfZ2xvYmFsX3B1dAoJcmV0c3ViCgpjcmVhdGVfTm9PcDoKCW1ldGhvZCAiY3JlYXRlQXBwbGljYXRpb24oKXZvaWQiCgl0eG5hIEFwcGxpY2F0aW9uQXJncyAwCgltYXRjaCBhYmlfcm91dGVfY3JlYXRlQXBwbGljYXRpb24KCWVycgoKY2FsbF9Ob09wOgoJbWV0aG9kICJ2ZXJpZnkoYnl0ZVtdLGJ5dGVbMzNdWzNdKXZvaWQiCgltZXRob2QgImFwcGVuZExlYWYoYnl0ZVtdLGJ5dGVbMzNdWzNdKXZvaWQiCgltZXRob2QgInVwZGF0ZUxlYWYoYnl0ZVtdLGJ5dGVbXSxieXRlWzMzXVszXSl2b2lkIgoJdHhuYSBBcHBsaWNhdGlvbkFyZ3MgMAoJbWF0Y2ggYWJpX3JvdXRlX3ZlcmlmeSBhYmlfcm91dGVfYXBwZW5kTGVhZiBhYmlfcm91dGVfdXBkYXRlTGVhZgoJZXJyCgpjYWxsX0RlbGV0ZUFwcGxpY2F0aW9uOgoJbWV0aG9kICJkZWxldGVBcHBsaWNhdGlvbigpdm9pZCIKCXR4bmEgQXBwbGljYXRpb25BcmdzIDAKCW1hdGNoIGFiaV9yb3V0ZV9kZWxldGVBcHBsaWNhdGlvbgoJZXJy",
    "clear": "I3ByYWdtYSB2ZXJzaW9uIDk="
  },
  "contract": {
    "name": "MerkleTree",
    "desc": "",
    "methods": [
      {
        "name": "deleteApplication",
        "args": [],
        "desc": "",
        "returns": {
          "type": "void",
          "desc": ""
        }
      },
      {
        "name": "createApplication",
        "args": [],
        "desc": "",
        "returns": {
          "type": "void",
          "desc": ""
        }
      },
      {
        "name": "verify",
        "args": [
          {
            "name": "data",
            "type": "byte[]",
            "desc": ""
          },
          {
            "name": "path",
            "type": "byte[33][3]",
            "desc": ""
          }
        ],
        "desc": "",
        "returns": {
          "type": "void",
          "desc": ""
        }
      },
      {
        "name": "appendLeaf",
        "args": [
          {
            "name": "data",
            "type": "byte[]",
            "desc": ""
          },
          {
            "name": "path",
            "type": "byte[33][3]",
            "desc": ""
          }
        ],
        "desc": "",
        "returns": {
          "type": "void",
          "desc": ""
        }
      },
      {
        "name": "updateLeaf",
        "args": [
          {
            "name": "oldData",
            "type": "byte[]",
            "desc": ""
          },
          {
            "name": "newData",
            "type": "byte[]",
            "desc": ""
          },
          {
            "name": "path",
            "type": "byte[33][3]",
            "desc": ""
          }
        ],
        "desc": "",
        "returns": {
          "type": "void",
          "desc": ""
        }
      }
    ]
  }
}

/**
 * Defines an onCompletionAction of 'no_op'
 */
export type OnCompleteNoOp =  { onCompleteAction?: 'no_op' | OnApplicationComplete.NoOpOC }
/**
 * Defines an onCompletionAction of 'opt_in'
 */
export type OnCompleteOptIn =  { onCompleteAction: 'opt_in' | OnApplicationComplete.OptInOC }
/**
 * Defines an onCompletionAction of 'close_out'
 */
export type OnCompleteCloseOut =  { onCompleteAction: 'close_out' | OnApplicationComplete.CloseOutOC }
/**
 * Defines an onCompletionAction of 'delete_application'
 */
export type OnCompleteDelApp =  { onCompleteAction: 'delete_application' | OnApplicationComplete.DeleteApplicationOC }
/**
 * Defines an onCompletionAction of 'update_application'
 */
export type OnCompleteUpdApp =  { onCompleteAction: 'update_application' | OnApplicationComplete.UpdateApplicationOC }
/**
 * A state record containing a single unsigned integer
 */
export type IntegerState = {
  /**
   * Gets the state value as a BigInt 
   */
  asBigInt(): bigint
  /**
   * Gets the state value as a number.
   */
  asNumber(): number
}
/**
 * A state record containing binary data
 */
export type BinaryState = {
  /**
   * Gets the state value as a Uint8Array
   */
  asByteArray(): Uint8Array
  /**
   * Gets the state value as a string
   */
  asString(): string
}

/**
 * Defines the types of available calls and state of the MerkleTree smart contract.
 */
export type MerkleTree = {
  /**
   * Maps method signatures / names to their argument and return types.
   */
  methods:
    & Record<'deleteApplication()void' | 'deleteApplication', {
      argsObj: {
      }
      argsTuple: []
      returns: void
    }>
    & Record<'createApplication()void' | 'createApplication', {
      argsObj: {
      }
      argsTuple: []
      returns: void
    }>
    & Record<'verify(byte[],byte[33][3])void' | 'verify', {
      argsObj: {
        data: Uint8Array
        path: [Uint8Array, Uint8Array, Uint8Array]
      }
      argsTuple: [data: Uint8Array, path: [Uint8Array, Uint8Array, Uint8Array]]
      returns: void
    }>
    & Record<'appendLeaf(byte[],byte[33][3])void' | 'appendLeaf', {
      argsObj: {
        data: Uint8Array
        path: [Uint8Array, Uint8Array, Uint8Array]
      }
      argsTuple: [data: Uint8Array, path: [Uint8Array, Uint8Array, Uint8Array]]
      returns: void
    }>
    & Record<'updateLeaf(byte[],byte[],byte[33][3])void' | 'updateLeaf', {
      argsObj: {
        oldData: Uint8Array
        newData: Uint8Array
        path: [Uint8Array, Uint8Array, Uint8Array]
      }
      argsTuple: [oldData: Uint8Array, newData: Uint8Array, path: [Uint8Array, Uint8Array, Uint8Array]]
      returns: void
    }>
  /**
   * Defines the shape of the global and local state of the application.
   */
  state: {
    global: {
      'root'?: BinaryState
      'size'?: IntegerState
    }
  }
}
/**
 * Defines the possible abi call signatures
 */
export type MerkleTreeSig = keyof MerkleTree['methods']
/**
 * Defines an object containing all relevant parameters for a single call to the contract. Where TSignature is undefined, a bare call is made
 */
export type TypedCallParams<TSignature extends MerkleTreeSig | undefined> = {
  method: TSignature
  methodArgs: TSignature extends undefined ? undefined : Array<ABIAppCallArg | undefined>
} & AppClientCallCoreParams & CoreAppCallArgs
/**
 * Defines the arguments required for a bare call
 */
export type BareCallArgs = Omit<RawAppCallArgs, keyof CoreAppCallArgs>
/**
 * Maps a method signature from the MerkleTree smart contract to the method's arguments in either tuple of struct form
 */
export type MethodArgs<TSignature extends MerkleTreeSig> = MerkleTree['methods'][TSignature]['argsObj' | 'argsTuple']
/**
 * Maps a method signature from the MerkleTree smart contract to the method's return type
 */
export type MethodReturn<TSignature extends MerkleTreeSig> = MerkleTree['methods'][TSignature]['returns']

/**
 * A factory for available 'create' calls
 */
export type MerkleTreeCreateCalls = (typeof MerkleTreeCallFactory)['create']
/**
 * Defines supported create methods for this smart contract
 */
export type MerkleTreeCreateCallParams =
  | (TypedCallParams<'createApplication()void'> & (OnCompleteNoOp))
/**
 * A factory for available 'delete' calls
 */
export type MerkleTreeDeleteCalls = (typeof MerkleTreeCallFactory)['delete']
/**
 * Defines supported delete methods for this smart contract
 */
export type MerkleTreeDeleteCallParams =
  | TypedCallParams<'deleteApplication()void'>
/**
 * Defines arguments required for the deploy method.
 */
export type MerkleTreeDeployArgs = {
  deployTimeParams?: TealTemplateParams
  /**
   * A delegate which takes a create call factory and returns the create call params for this smart contract
   */
  createCall?: (callFactory: MerkleTreeCreateCalls) => MerkleTreeCreateCallParams
  /**
   * A delegate which takes a delete call factory and returns the delete call params for this smart contract
   */
  deleteCall?: (callFactory: MerkleTreeDeleteCalls) => MerkleTreeDeleteCallParams
}


/**
 * Exposes methods for constructing all available smart contract calls
 */
export abstract class MerkleTreeCallFactory {
  /**
   * Gets available create call factories
   */
  static get create() {
    return {
      /**
       * Constructs a create call for the MerkleTree smart contract using the createApplication()void ABI method
       *
       * @param args Any args for the contract call
       * @param params Any additional parameters for the call
       * @returns A TypedCallParams object for the call
       */
      createApplication(args: MethodArgs<'createApplication()void'>, params: AppClientCallCoreParams & CoreAppCallArgs & AppClientCompilationParams & (OnCompleteNoOp) = {}) {
        return {
          method: 'createApplication()void' as const,
          methodArgs: Array.isArray(args) ? args : [],
          ...params,
        }
      },
    }
  }

  /**
   * Gets available delete call factories
   */
  static get delete() {
    return {
      /**
       * Constructs a delete call for the MerkleTree smart contract using the deleteApplication()void ABI method
       *
       * @param args Any args for the contract call
       * @param params Any additional parameters for the call
       * @returns A TypedCallParams object for the call
       */
      deleteApplication(args: MethodArgs<'deleteApplication()void'>, params: AppClientCallCoreParams & CoreAppCallArgs = {}) {
        return {
          method: 'deleteApplication()void' as const,
          methodArgs: Array.isArray(args) ? args : [],
          ...params,
        }
      },
    }
  }

  /**
   * Constructs a no op call for the verify(byte[],byte[33][3])void ABI method
   *
   * @param args Any args for the contract call
   * @param params Any additional parameters for the call
   * @returns A TypedCallParams object for the call
   */
  static verify(args: MethodArgs<'verify(byte[],byte[33][3])void'>, params: AppClientCallCoreParams & CoreAppCallArgs) {
    return {
      method: 'verify(byte[],byte[33][3])void' as const,
      methodArgs: Array.isArray(args) ? args : [args.data, args.path],
      ...params,
    }
  }
  /**
   * Constructs a no op call for the appendLeaf(byte[],byte[33][3])void ABI method
   *
   * @param args Any args for the contract call
   * @param params Any additional parameters for the call
   * @returns A TypedCallParams object for the call
   */
  static appendLeaf(args: MethodArgs<'appendLeaf(byte[],byte[33][3])void'>, params: AppClientCallCoreParams & CoreAppCallArgs) {
    return {
      method: 'appendLeaf(byte[],byte[33][3])void' as const,
      methodArgs: Array.isArray(args) ? args : [args.data, args.path],
      ...params,
    }
  }
  /**
   * Constructs a no op call for the updateLeaf(byte[],byte[],byte[33][3])void ABI method
   *
   * @param args Any args for the contract call
   * @param params Any additional parameters for the call
   * @returns A TypedCallParams object for the call
   */
  static updateLeaf(args: MethodArgs<'updateLeaf(byte[],byte[],byte[33][3])void'>, params: AppClientCallCoreParams & CoreAppCallArgs) {
    return {
      method: 'updateLeaf(byte[],byte[],byte[33][3])void' as const,
      methodArgs: Array.isArray(args) ? args : [args.oldData, args.newData, args.path],
      ...params,
    }
  }
}

/**
 * A client to make calls to the MerkleTree smart contract
 */
export class MerkleTreeClient {
  /**
   * The underlying `ApplicationClient` for when you want to have more flexibility
   */
  public readonly appClient: ApplicationClient

  private readonly sender: SendTransactionFrom | undefined

  /**
   * Creates a new instance of `MerkleTreeClient`
   *
   * @param appDetails appDetails The details to identify the app to deploy
   * @param algod An algod client instance
   */
  constructor(appDetails: AppDetails, private algod: Algodv2) {
    this.sender = appDetails.sender
    this.appClient = algokit.getAppClient({
      ...appDetails,
      app: APP_SPEC
    }, algod)
  }

  /**
   * Checks for decode errors on the AppCallTransactionResult and maps the return value to the specified generic type
   *
   * @param result The AppCallTransactionResult to be mapped
   * @param returnValueFormatter An optional delegate to format the return value if required
   * @returns The smart contract response with an updated return value
   */
  protected mapReturnValue<TReturn>(result: AppCallTransactionResult, returnValueFormatter?: (value: any) => TReturn): AppCallTransactionResultOfType<TReturn> {
    if(result.return?.decodeError) {
      throw result.return.decodeError
    }
    const returnValue = result.return?.returnValue !== undefined && returnValueFormatter !== undefined
      ? returnValueFormatter(result.return.returnValue)
      : result.return?.returnValue as TReturn | undefined
      return { ...result, return: returnValue }
  }

  /**
   * Calls the ABI method with the matching signature using an onCompletion code of NO_OP
   *
   * @param typedCallParams An object containing the method signature, args, and any other relevant parameters
   * @param returnValueFormatter An optional delegate which when provided will be used to map non-undefined return values to the target type
   * @returns The result of the smart contract call
   */
  public async call<TSignature extends keyof MerkleTree['methods']>(typedCallParams: TypedCallParams<TSignature>, returnValueFormatter?: (value: any) => MethodReturn<TSignature>) {
    return this.mapReturnValue<MethodReturn<TSignature>>(await this.appClient.call(typedCallParams), returnValueFormatter)
  }

  /**
   * Idempotently deploys the MerkleTree smart contract.
   *
   * @param params The arguments for the contract calls and any additional parameters for the call
   * @returns The deployment result
   */
  public deploy(params: MerkleTreeDeployArgs & AppClientDeployCoreParams = {}): ReturnType<ApplicationClient['deploy']> {
    const createArgs = params.createCall?.(MerkleTreeCallFactory.create)
    const deleteArgs = params.deleteCall?.(MerkleTreeCallFactory.delete)
    return this.appClient.deploy({
      ...params,
      deleteArgs,
      createArgs,
      createOnCompleteAction: createArgs?.onCompleteAction,
    })
  }

  /**
   * Gets available create methods
   */
  public get create() {
    const $this = this
    return {
      /**
       * Creates a new instance of the MerkleTree smart contract using the createApplication()void ABI method.
       *
       * @param args The arguments for the smart contract call
       * @param params Any additional parameters for the call
       * @returns The create result
       */
      async createApplication(args: MethodArgs<'createApplication()void'>, params: AppClientCallCoreParams & AppClientCompilationParams & (OnCompleteNoOp) = {}): Promise<AppCallTransactionResultOfType<MethodReturn<'createApplication()void'>>> {
        return $this.mapReturnValue(await $this.appClient.create(MerkleTreeCallFactory.create.createApplication(args, params)))
      },
    }
  }

  /**
   * Gets available delete methods
   */
  public get delete() {
    const $this = this
    return {
      /**
       * Deletes an existing instance of the MerkleTree smart contract using the deleteApplication()void ABI method.
       *
       * @param args The arguments for the smart contract call
       * @param params Any additional parameters for the call
       * @returns The delete result
       */
      async deleteApplication(args: MethodArgs<'deleteApplication()void'>, params: AppClientCallCoreParams = {}): Promise<AppCallTransactionResultOfType<MethodReturn<'deleteApplication()void'>>> {
        return $this.mapReturnValue(await $this.appClient.delete(MerkleTreeCallFactory.delete.deleteApplication(args, params)))
      },
    }
  }

  /**
   * Makes a clear_state call to an existing instance of the MerkleTree smart contract.
   *
   * @param args The arguments for the bare call
   * @returns The clear_state result
   */
  public clearState(args: BareCallArgs & AppClientCallCoreParams & CoreAppCallArgs = {}) {
    return this.appClient.clearState(args)
  }

  /**
   * Calls the verify(byte[],byte[33][3])void ABI method.
   *
   * @param args The arguments for the contract call
   * @param params Any additional parameters for the call
   * @returns The result of the call
   */
  public verify(args: MethodArgs<'verify(byte[],byte[33][3])void'>, params: AppClientCallCoreParams & CoreAppCallArgs = {}) {
    return this.call(MerkleTreeCallFactory.verify(args, params))
  }

  /**
   * Calls the appendLeaf(byte[],byte[33][3])void ABI method.
   *
   * @param args The arguments for the contract call
   * @param params Any additional parameters for the call
   * @returns The result of the call
   */
  public appendLeaf(args: MethodArgs<'appendLeaf(byte[],byte[33][3])void'>, params: AppClientCallCoreParams & CoreAppCallArgs = {}) {
    return this.call(MerkleTreeCallFactory.appendLeaf(args, params))
  }

  /**
   * Calls the updateLeaf(byte[],byte[],byte[33][3])void ABI method.
   *
   * @param args The arguments for the contract call
   * @param params Any additional parameters for the call
   * @returns The result of the call
   */
  public updateLeaf(args: MethodArgs<'updateLeaf(byte[],byte[],byte[33][3])void'>, params: AppClientCallCoreParams & CoreAppCallArgs = {}) {
    return this.call(MerkleTreeCallFactory.updateLeaf(args, params))
  }

  /**
   * Extracts a binary state value out of an AppState dictionary
   *
   * @param state The state dictionary containing the state value
   * @param key The key of the state value
   * @returns A BinaryState instance containing the state value, or undefined if the key was not found
   */
  private static getBinaryState(state: AppState, key: string): BinaryState | undefined {
    const value = state[key]
    if (!value) return undefined
    if (!('valueRaw' in value))
      throw new Error(`Failed to parse state value for ${key}; received an int when expected a byte array`)
    return {
      asString(): string {
        return value.value
      },
      asByteArray(): Uint8Array {
        return value.valueRaw
      }
    }
  }

  /**
   * Extracts a integer state value out of an AppState dictionary
   *
   * @param state The state dictionary containing the state value
   * @param key The key of the state value
   * @returns An IntegerState instance containing the state value, or undefined if the key was not found
   */
  private static getIntegerState(state: AppState, key: string): IntegerState | undefined {
    const value = state[key]
    if (!value) return undefined
    if ('valueRaw' in value)
      throw new Error(`Failed to parse state value for ${key}; received a byte array when expected a number`)
    return {
      asBigInt() {
        return typeof value.value === 'bigint' ? value.value : BigInt(value.value)
      },
      asNumber(): number {
        return typeof value.value === 'bigint' ? Number(value.value) : value.value
      },
    }
  }

  /**
   * Returns the smart contract's global state wrapped in a strongly typed accessor with options to format the stored value
   */
  public async getGlobalState(): Promise<MerkleTree['state']['global']> {
    const state = await this.appClient.getGlobalState()
    return {
      get root() {
        return MerkleTreeClient.getBinaryState(state, 'root')
      },
      get size() {
        return MerkleTreeClient.getIntegerState(state, 'size')
      },
    }
  }

  public compose(): MerkleTreeComposer {
    const client = this
    const atc = new AtomicTransactionComposer()
    let promiseChain:Promise<unknown> = Promise.resolve()
    const resultMappers: Array<undefined | ((x: any) => any)> = []
    return {
      verify(args: MethodArgs<'verify(byte[],byte[33][3])void'>, params?: AppClientCallCoreParams & CoreAppCallArgs) {
        promiseChain = promiseChain.then(() => client.verify(args, {...params, sendParams: {...params?.sendParams, skipSending: true, atc}}))
        resultMappers.push(undefined)
        return this
      },
      appendLeaf(args: MethodArgs<'appendLeaf(byte[],byte[33][3])void'>, params?: AppClientCallCoreParams & CoreAppCallArgs) {
        promiseChain = promiseChain.then(() => client.appendLeaf(args, {...params, sendParams: {...params?.sendParams, skipSending: true, atc}}))
        resultMappers.push(undefined)
        return this
      },
      updateLeaf(args: MethodArgs<'updateLeaf(byte[],byte[],byte[33][3])void'>, params?: AppClientCallCoreParams & CoreAppCallArgs) {
        promiseChain = promiseChain.then(() => client.updateLeaf(args, {...params, sendParams: {...params?.sendParams, skipSending: true, atc}}))
        resultMappers.push(undefined)
        return this
      },
      get delete() {
        const $this = this
        return {
          deleteApplication(args: MethodArgs<'deleteApplication()void'>, params?: AppClientCallCoreParams) {
            promiseChain = promiseChain.then(() => client.delete.deleteApplication(args, {...params, sendParams: {...params?.sendParams, skipSending: true, atc}}))
            resultMappers.push(undefined)
            return $this
          },
        }
      },
      clearState(args?: BareCallArgs & AppClientCallCoreParams & CoreAppCallArgs) {
        promiseChain = promiseChain.then(() => client.clearState({...args, sendParams: {...args?.sendParams, skipSending: true, atc}}))
        resultMappers.push(undefined)
        return this
      },
      addTransaction(txn: TransactionWithSigner | TransactionToSign | Transaction | Promise<SendTransactionResult>, defaultSender?: SendTransactionFrom) {
        promiseChain = promiseChain.then(async () => atc.addTransaction(await algokit.getTransactionWithSigner(txn, defaultSender ?? client.sender)))
        return this
      },
      async atc() {
        await promiseChain
        return atc
      },
      async execute() {
        await promiseChain
        const result = await algokit.sendAtomicTransactionComposer({ atc, sendParams: {} }, client.algod)
        return {
          ...result,
          returns: result.returns?.map((val, i) => resultMappers[i] !== undefined ? resultMappers[i]!(val.returnValue) : val.returnValue)
        }
      }
    } as unknown as MerkleTreeComposer
  }
}
export type MerkleTreeComposer<TReturns extends [...any[]] = []> = {
  /**
   * Calls the verify(byte[],byte[33][3])void ABI method.
   *
   * @param args The arguments for the contract call
   * @param params Any additional parameters for the call
   * @returns The typed transaction composer so you can fluently chain multiple calls or call execute to execute all queued up transactions
   */
  verify(args: MethodArgs<'verify(byte[],byte[33][3])void'>, params?: AppClientCallCoreParams & CoreAppCallArgs): MerkleTreeComposer<[...TReturns, MethodReturn<'verify(byte[],byte[33][3])void'>]>

  /**
   * Calls the appendLeaf(byte[],byte[33][3])void ABI method.
   *
   * @param args The arguments for the contract call
   * @param params Any additional parameters for the call
   * @returns The typed transaction composer so you can fluently chain multiple calls or call execute to execute all queued up transactions
   */
  appendLeaf(args: MethodArgs<'appendLeaf(byte[],byte[33][3])void'>, params?: AppClientCallCoreParams & CoreAppCallArgs): MerkleTreeComposer<[...TReturns, MethodReturn<'appendLeaf(byte[],byte[33][3])void'>]>

  /**
   * Calls the updateLeaf(byte[],byte[],byte[33][3])void ABI method.
   *
   * @param args The arguments for the contract call
   * @param params Any additional parameters for the call
   * @returns The typed transaction composer so you can fluently chain multiple calls or call execute to execute all queued up transactions
   */
  updateLeaf(args: MethodArgs<'updateLeaf(byte[],byte[],byte[33][3])void'>, params?: AppClientCallCoreParams & CoreAppCallArgs): MerkleTreeComposer<[...TReturns, MethodReturn<'updateLeaf(byte[],byte[],byte[33][3])void'>]>

  /**
   * Gets available delete methods
   */
  readonly delete: {
    /**
     * Deletes an existing instance of the MerkleTree smart contract using the deleteApplication()void ABI method.
     *
     * @param args The arguments for the smart contract call
     * @param params Any additional parameters for the call
     * @returns The typed transaction composer so you can fluently chain multiple calls or call execute to execute all queued up transactions
     */
    deleteApplication(args: MethodArgs<'deleteApplication()void'>, params?: AppClientCallCoreParams): MerkleTreeComposer<[...TReturns, MethodReturn<'deleteApplication()void'>]>
  }

  /**
   * Makes a clear_state call to an existing instance of the MerkleTree smart contract.
   *
   * @param args The arguments for the bare call
   * @returns The typed transaction composer so you can fluently chain multiple calls or call execute to execute all queued up transactions
   */
  clearState(args?: BareCallArgs & AppClientCallCoreParams & CoreAppCallArgs): MerkleTreeComposer<[...TReturns, undefined]>

  /**
   * Adds a transaction to the composer
   *
   * @param txn One of: A TransactionWithSigner object (returned as is), a TransactionToSign object (signer is obtained from the signer property), a Transaction object (signer is extracted from the defaultSender parameter), an async SendTransactionResult returned by one of algokit utils helpers (signer is obtained from the defaultSender parameter)
   * @param defaultSender The default sender to be used to obtain a signer where the object provided to the transaction parameter does not include a signer.
   */
  addTransaction(txn: TransactionWithSigner | TransactionToSign | Transaction | Promise<SendTransactionResult>, defaultSender?: SendTransactionFrom): MerkleTreeComposer<TReturns>
  /**
   * Returns the underlying AtomicTransactionComposer instance
   */
  atc(): Promise<AtomicTransactionComposer>
  /**
   * Executes the transaction group and returns an array of results
   */
  execute(): Promise<MerkleTreeComposerResults<TReturns>>
}
export type MerkleTreeComposerResults<TReturns extends [...any[]]> = {
  returns: TReturns
  groupId: string
  txIds: string[]
  transactions: Transaction[]
}
