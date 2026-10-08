import type { FastifyPluginAsync } from "fastify"
import { tutoriels } from "../../src/lib/tutoriels-data"
import { auth } from "../auth/auth"
import { authRequestHeaders } from "../auth/request-headers"
import { allowsBrowserMutation } from "../browser-mutation"
import { parseTutorialId, parseTutorialProgress, parseTutorialVersion, tutorialProgressDto } from "./contract"
import { listTutorialProgress, saveTutorialProgress, TutorialVersionConflict } from "./service"

declare module "fastify" {
  interface FastifyRequest {
    tutorialProgressUserId: string | null
  }
}

const catalogById = new Map(tutoriels.map((tutorial) => [tutorial.id, tutorial]))

export const tutorialProgressRoutes: FastifyPluginAsync = async (app) => {
  app.decorateRequest("tutorialProgressUserId", null)
  app.addHook("onRequest", async (request, reply) => {
    reply.header("Cache-Control", "no-store")
    if (request.method === "PUT" && !allowsBrowserMutation(request)) {
      return reply.code(403).send({ code: "INVALID_REQUEST", message: "Invalid request" })
    }
    const session = await auth.api.getSession({ headers: authRequestHeaders(request) })
    request.tutorialProgressUserId = session?.user.id ?? null
    if (!request.tutorialProgressUserId) {
      return reply.code(401).send({ code: "UNAUTHENTICATED", message: "Authentication required" })
    }
  })

  app.get("/me/tutorial-progress", async (request) => {
    const items = await listTutorialProgress(request.tutorialProgressUserId!)
    return { items: items.map(tutorialProgressDto) }
  })

  app.put<{ Params: { tutorialId: string }; Body: unknown }>(
    "/me/tutorial-progress/:tutorialId",
    async (request, reply) => {
      const tutorialId = parseTutorialId(request.params.tutorialId)
      if (tutorialId === null) {
        return reply.code(400).send({ code: "INVALID_TUTORIAL_ID", message: "Invalid tutorial id" })
      }
      const tutorial = catalogById.get(tutorialId)
      if (!tutorial) {
        return reply.code(404).send({ code: "TUTORIAL_NOT_FOUND", message: "Tutorial not found" })
      }
      const conflict = () => reply.code(409).send({ code: "TUTORIAL_VERSION_CONFLICT", message: "Incompatible tutorial progress version" })
      const requestedVersion = parseTutorialVersion(request.body)
      if (requestedVersion !== null && requestedVersion !== tutorial.version) return conflict()
      const progress = parseTutorialProgress(request.body, tutorial.steps.length)
      if (!progress) {
        return reply.code(400).send({ code: "INVALID_TUTORIAL_PROGRESS", message: "Invalid tutorial progress" })
      }
      try {
        return tutorialProgressDto(await saveTutorialProgress(request.tutorialProgressUserId!, tutorialId, progress))
      } catch (error) {
        if (error instanceof TutorialVersionConflict) return conflict()
        throw error
      }
    },
  )
}
