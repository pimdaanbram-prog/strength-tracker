import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useProfiles } from '@/features/profiles/hooks/useProfiles'
import type { UserProfile } from '@/shared/store/appStore'
import Input from '@/shared/components/ui/Input'
import Button from '@/shared/components/ui/Button'
import Card from '@/shared/components/ui/Card'
import Badge from '@/shared/components/ui/Badge'
import Progress from '@/shared/components/ui/Progress'
import {
  StepWrapper,
  EmojiPicker,
  OptionCard,
  Chip,
  ColorPicker,
  StepTitle,
} from '@/features/profiles/components/ProfileForm'

const TOTAL_STEPS = 8

const AVATARS = ['💪', '🏋️‍♂️', '🏃‍♀️', '🧘‍♂️', '⚡', '🔥', '🏆', '🎯', '💎', '🦾']

const PRESET_COLORS = [
  '#3B82F6', '#8B5CF6', '#EC4899', '#EF4444',
  '#F59E0B', '#10B981', '#06B6D4', '#F97316',
]

const GOALS: { key: UserProfile['goals'][number]; label: string }[] = [
  { key: 'strength', label: 'Kracht' },
  { key: 'muscle', label: 'Spieropbouw' },
  { key: 'endurance', label: 'Uithoudingsvermogen' },
  { key: 'weightloss', label: 'Afvallen' },
  { key: 'general', label: 'Algemene Fitness' },
]

const EQUIPMENT = [
  'Barbell',
  'Dumbbell',
  'Cable',
  'Machine',
  'Kettlebell',
  'Bench',
  'Alleen lichaamsgewicht',
]

const FITNESS_LEVELS: {
  key: UserProfile['fitnessLevel']
  title: string
  description: string
}[] = [
  {
    key: 'beginner',
    title: 'Beginner',
    description: 'Nieuw met krachttraining of minder dan 6 maanden ervaring',
  },
  {
    key: 'intermediate',
    title: 'Gemiddeld',
    description: '6 maanden tot 2 jaar regelmatige trainingservaring',
  },
  {
    key: 'advanced',
    title: 'Gevorderd',
    description: 'Meer dan 2 jaar consistente trainingservaring',
  },
]

export default function ProfileNew() {
  const navigate = useNavigate()
  const { addProfile } = useProfiles()
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)

  // Form state
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState('💪')
  const [gender, setGender] = useState<'male' | 'female'>('male')
  const [age, setAge] = useState('')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [fitnessLevel, setFitnessLevel] = useState<UserProfile['fitnessLevel']>('beginner')
  const [goals, setGoals] = useState<UserProfile['goals']>([])
  const [equipment, setEquipment] = useState<string[]>([])
  const [color, setColor] = useState('#3B82F6')

  const progress = (step / TOTAL_STEPS) * 100

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return name.trim().length >= 2
      case 2: return !!gender && !!age && parseInt(age) > 0
      case 3: return !!weight && !!height && parseFloat(weight) > 0 && parseFloat(height) > 0
      case 4: return !!fitnessLevel
      case 5: return goals.length > 0
      case 6: return equipment.length > 0
      case 7: return !!color
      case 8: return true
      default: return false
    }
  }

  const goNext = () => {
    if (step < TOTAL_STEPS && canProceed()) {
      setDirection(1)
      setStep(step + 1)
    }
  }

  const goPrev = () => {
    if (step > 1) {
      setDirection(-1)
      setStep(step - 1)
    }
  }

  const toggleGoal = (goal: UserProfile['goals'][number]) => {
    setGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    )
  }

  const toggleEquipment = (item: string) => {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    )
  }

  const handleSubmit = () => {
    const profile: UserProfile = {
      id: crypto.randomUUID(),
      name: name.trim(),
      gender,
      age: parseInt(age),
      weight: parseFloat(weight),
      height: parseFloat(height),
      fitnessLevel,
      goals,
      availableEquipment: equipment,
      createdAt: new Date().toISOString(),
      avatar,
      color,
    }
    addProfile(profile)
    navigate('/profiles')
  }

  const levelLabels: Record<string, string> = {
    beginner: 'Beginner',
    intermediate: 'Gemiddeld',
    advanced: 'Gevorderd',
  }

  const goalLabels: Record<string, string> = {
    strength: 'Kracht',
    muscle: 'Spieropbouw',
    endurance: 'Uithoudingsvermogen',
    weightloss: 'Afvallen',
    general: 'Algemene Fitness',
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <StepWrapper direction={direction}>
            <StepTitle title="Wie Ben Je?" subtitle="Kies een naam en avatar" />
            <div className="space-y-6">
              <Input
                label="Naam"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Je naam"
                autoFocus
              />
              <div>
                <p className="text-sm font-medium text-text-secondary mb-3">
                  Kies een avatar
                </p>
                <EmojiPicker
                  emojis={AVATARS}
                  selected={avatar}
                  onSelect={setAvatar}
                />
              </div>
            </div>
          </StepWrapper>
        )

      case 2:
        return (
          <StepWrapper direction={direction}>
            <StepTitle title="Over Jou" subtitle="Dit helpt bij het berekenen van aanbevolen gewichten" />
            <div className="space-y-6">
              <div>
                <p className="text-sm font-medium text-text-secondary mb-3">
                  Geslacht
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <OptionCard
                    title="Man"
                    selected={gender === 'male'}
                    onSelect={() => setGender('male')}
                  />
                  <OptionCard
                    title="Vrouw"
                    selected={gender === 'female'}
                    onSelect={() => setGender('female')}
                  />
                </div>
              </div>
              <Input
                label="Leeftijd"
                type="number"
                inputMode="numeric"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
                min="10"
                max="100"
              />
            </div>
          </StepWrapper>
        )

      case 3:
        return (
          <StepWrapper direction={direction}>
            <StepTitle title="Lichaam" subtitle="Wordt gebruikt voor gewichtsaanbevelingen" />
            <div className="space-y-6">
              <Input
                label="Gewicht (kg)"
                type="number"
                inputMode="decimal"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="75"
                min="30"
                max="300"
              />
              <Input
                label="Lengte (cm)"
                type="number"
                inputMode="decimal"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="175"
                min="100"
                max="250"
              />
            </div>
          </StepWrapper>
        )

      case 4:
        return (
          <StepWrapper direction={direction}>
            <StepTitle title="Fitnessniveau" subtitle="Wees eerlijk, dit past je programma aan" />
            <div className="space-y-3">
              {FITNESS_LEVELS.map((level) => (
                <OptionCard
                  key={level.key}
                  title={level.title}
                  description={level.description}
                  selected={fitnessLevel === level.key}
                  onSelect={() => setFitnessLevel(level.key)}
                />
              ))}
            </div>
          </StepWrapper>
        )

      case 5:
        return (
          <StepWrapper direction={direction}>
            <StepTitle title="Doelen" subtitle="Selecteer een of meer doelen" />
            <div className="flex flex-wrap gap-3">
              {GOALS.map((goal) => (
                <Chip
                  key={goal.key}
                  label={goal.label}
                  selected={goals.includes(goal.key)}
                  onToggle={() => toggleGoal(goal.key)}
                  color={color}
                />
              ))}
            </div>
          </StepWrapper>
        )

      case 6:
        return (
          <StepWrapper direction={direction}>
            <StepTitle title="Apparatuur" subtitle="Welke apparatuur heb je beschikbaar?" />
            <div className="flex flex-wrap gap-3">
              {EQUIPMENT.map((item) => (
                <Chip
                  key={item}
                  label={item}
                  selected={equipment.includes(item)}
                  onToggle={() => toggleEquipment(item)}
                  color={color}
                />
              ))}
            </div>
          </StepWrapper>
        )

      case 7:
        return (
          <StepWrapper direction={direction}>
            <StepTitle title="Accentkleur" subtitle="Kies jouw kleur" />
            <ColorPicker
              colors={PRESET_COLORS}
              selected={color}
              onSelect={setColor}
            />
            <div
              className="mt-8 p-4 rounded-2xl border flex items-center gap-3"
              style={{ borderColor: color, backgroundColor: `${color}10` }}
            >
              <span className="text-2xl">{avatar}</span>
              <div>
                <p className="font-medium text-text-primary">{name || 'Naam'}</p>
                <p className="text-xs" style={{ color }}>
                  {levelLabels[fitnessLevel]}
                </p>
              </div>
            </div>
          </StepWrapper>
        )

      case 8:
        return (
          <StepWrapper direction={direction}>
            <StepTitle title="Overzicht" subtitle="Controleer je gegevens" />
            <Card className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                  style={{ backgroundColor: `${color}20` }}
                >
                  {avatar}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-text-primary">{name}</h3>
                  <Badge variant="accent">{levelLabels[fitnessLevel]}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-bg-input rounded-xl p-3">
                  <p className="text-text-muted text-xs">Geslacht</p>
                  <p className="text-text-primary font-medium">
                    {gender === 'male' ? 'Man' : 'Vrouw'}
                  </p>
                </div>
                <div className="bg-bg-input rounded-xl p-3">
                  <p className="text-text-muted text-xs">Leeftijd</p>
                  <p className="text-text-primary font-medium">{age} jaar</p>
                </div>
                <div className="bg-bg-input rounded-xl p-3">
                  <p className="text-text-muted text-xs">Gewicht</p>
                  <p className="text-text-primary font-medium">{weight} kg</p>
                </div>
                <div className="bg-bg-input rounded-xl p-3">
                  <p className="text-text-muted text-xs">Lengte</p>
                  <p className="text-text-primary font-medium">{height} cm</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-text-muted mb-2">Doelen</p>
                <div className="flex flex-wrap gap-2">
                  {goals.map((g) => (
                    <Badge key={g} variant="accent">{goalLabels[g]}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-text-muted mb-2">Apparatuur</p>
                <div className="flex flex-wrap gap-2">
                  {equipment.map((e) => (
                    <Badge key={e}>{e}</Badge>
                  ))}
                </div>
              </div>
            </Card>
          </StepWrapper>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Top bar */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => (step > 1 ? goPrev() : navigate('/profiles'))}
            className="p-2 rounded-xl hover:bg-white/5 text-text-muted
                       hover:text-text-primary transition-colors cursor-pointer"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <Progress value={progress} color={color} height={4} />
          </div>
          <span className="text-xs text-text-muted whitespace-nowrap">
            {step}/{TOTAL_STEPS}
          </span>
        </div>

        {/* Step content */}
        <div className="mb-8 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <div key={step}>{renderStep()}</div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex gap-3">
          {step > 1 && (
            <Button variant="secondary" onClick={goPrev} size="lg">
              Vorige
            </Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button
              fullWidth
              size="lg"
              onClick={goNext}
              disabled={!canProceed()}
              style={canProceed() ? { backgroundColor: color } : undefined}
            >
              Volgende
            </Button>
          ) : (
            <Button
              fullWidth
              size="lg"
              onClick={handleSubmit}
              style={{ backgroundColor: color }}
            >
              Profiel Aanmaken
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
