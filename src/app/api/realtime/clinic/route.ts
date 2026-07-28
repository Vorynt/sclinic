import type { NextRequest } from "next/server"

import {
  subscribeClinicOps,
  type ClinicOpsChangedPayload,
} from "@/core/realtime"
import { requireClinic } from "@/modules/authentication/permissions/guards"
import { AppError, ErrorCode, getClientMessage } from "@/shared/errors"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 300

const HEARTBEAT_MS = 15_000
const ENCODER = new TextEncoder()

function formatSse(event: string, data: unknown): Uint8Array {
  return ENCODER.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`)
}

/**
 * Authenticated SSE stream for the active clinic (ADR-006).
 * Clients should invalidate reception/agenda queries on `clinic.ops`.
 */
export async function GET(request: NextRequest) {
  try {
    const auth = await requireClinic({ headers: request.headers })
    const clinicId = auth.clinicId

    let cleanup = () => {}
    let heartbeat: ReturnType<typeof setInterval> | undefined

    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const send = (event: string, data: unknown) => {
          try {
            controller.enqueue(formatSse(event, data))
          } catch {
            cleanup()
          }
        }

        send("ready", { clinicId, at: new Date().toISOString() })

        const onOps = (payload: ClinicOpsChangedPayload) => {
          send("clinic.ops", payload)
        }

        const unsubscribe = subscribeClinicOps(clinicId, onOps)

        heartbeat = setInterval(() => {
          send("heartbeat", { at: new Date().toISOString() })
        }, HEARTBEAT_MS)

        cleanup = () => {
          unsubscribe()
          if (heartbeat) clearInterval(heartbeat)
          try {
            controller.close()
          } catch {
            // already closed
          }
        }

        request.signal.addEventListener("abort", cleanup)
      },
      cancel() {
        cleanup()
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    })
  } catch (error) {
    if (error instanceof AppError) {
      const status =
        error.code === ErrorCode.UNAUTHORIZED ||
        error.code === ErrorCode.CLINIC_REQUIRED ||
        error.code === ErrorCode.PASSWORD_CHANGE_REQUIRED
          ? 401
          : error.code === ErrorCode.FORBIDDEN
            ? 403
            : 500

      return Response.json(
        { error: { code: error.code, message: error.message } },
        { status },
      )
    }

    return Response.json(
      {
        error: {
          code: ErrorCode.INTERNAL_ERROR,
          message: getClientMessage(ErrorCode.INTERNAL_ERROR),
        },
      },
      { status: 500 },
    )
  }
}
