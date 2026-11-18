export type TutorialProgressDto = {
  tutorialId: number
  tutorialVersion: number
  currentStep: number
  completedSteps: number[]
  createdAt: string
  updatedAt: string
}
