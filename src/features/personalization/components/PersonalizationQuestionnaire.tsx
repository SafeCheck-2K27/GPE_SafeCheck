import {
  DETAIL_LEVEL_OPTIONS,
  DEVICE_OPTIONS,
  DISCOVERY_OPTIONS,
  MOTIVATION_OPTIONS,
  TOPIC_OPTIONS,
} from "../data"
import type {
  MultiSelectField,
  PersonalizationAnswers,
  SingleSelectField,
} from "../types"
import { PersonalizationSectionCard } from "./PersonalizationSectionCard"
import { MultiChip, SingleChip, TechSlider } from "./PersonalizationSelectors"

export function PersonalizationQuestionnaire({
  form,
  toggleMulti,
  setSingle,
  setTechLevel,
}: {
  form: PersonalizationAnswers
  toggleMulti: (field: MultiSelectField) => (value: string) => void
  setSingle: (field: SingleSelectField) => (value: string) => void
  setTechLevel: (value: number) => void
}) {
  return (
    <>
      <PersonalizationSectionCard
        number={1}
        label="Objectif"
        question="Pourquoi utilisez-vous SafeCheck aujourd'hui ?"
      >
        <MultiChip
          options={MOTIVATION_OPTIONS}
          selected={form.motivations}
          onToggle={toggleMulti("motivations")}
        />
      </PersonalizationSectionCard>

      <PersonalizationSectionCard
        number={2}
        label="Niveau de détail"
        question="Quel niveau de détail préférez-vous ?"
      >
        <SingleChip
          options={DETAIL_LEVEL_OPTIONS}
          selected={form.detailLevel}
          onSelect={setSingle("detailLevel")}
        />
      </PersonalizationSectionCard>

      <PersonalizationSectionCard
        number={3}
        label="Appareils"
        question="Sur quels appareils voulez-vous surtout progresser ?"
      >
        <MultiChip
          options={DEVICE_OPTIONS}
          selected={form.devices}
          onToggle={toggleMulti("devices")}
        />
      </PersonalizationSectionCard>

      <PersonalizationSectionCard
        number={4}
        label="Aisance technologique"
        question="Quel est votre niveau d'aisance avec la technologie ?"
      >
        <TechSlider value={form.techLevel} onChange={setTechLevel} />
      </PersonalizationSectionCard>

      <PersonalizationSectionCard
        number={5}
        label="Centres d'intérêt"
        question="Quels sujets vous intéressent le plus ?"
      >
        <div className="flex flex-col gap-2">
          {form.topics.length >= 3 && (
            <p className="text-xs text-[color:var(--sc-text-muted)] italic">
              Maximum 3 sujets sélectionnés. Désélectionnez-en un pour en
              choisir un autre.
            </p>
          )}
          <MultiChip
            options={TOPIC_OPTIONS}
            selected={form.topics}
            onToggle={toggleMulti("topics")}
            maxSelect={3}
          />
        </div>
      </PersonalizationSectionCard>

      <PersonalizationSectionCard
        number={6}
        label="À propos"
        question="Comment avez-vous connu SafeCheck ?"
      >
        <SingleChip
          options={DISCOVERY_OPTIONS}
          selected={form.discovery}
          onSelect={setSingle("discovery")}
        />
      </PersonalizationSectionCard>
    </>
  )
}
