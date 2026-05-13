'use client'

interface CharacterCounterProps {
  current: number
  min: number
  max: number
}

export function CharacterCounter({ current, min, max }: CharacterCounterProps) {
  const isValid = current >= min && current <= max
  const isBelowMin = current < min && current > 0
  const isAboveMax = current > max

  let statusColor = 'text-muted-foreground'
  let statusBg = 'bg-transparent'

  if (isAboveMax) {
    statusColor = 'text-red-500'
    statusBg = 'bg-red-50'
  } else if (isBelowMin) {
    statusColor = 'text-yellow-600'
    statusBg = 'bg-yellow-50'
  } else if (isValid && current > 0) {
    statusColor = 'text-green-600'
    statusBg = 'bg-green-50'
  }

  const remaining = Math.max(0, max - current)
  const neededMin = Math.max(0, min - current)

  return (
    <div className={`text-sm px-3 py-2 rounded-md ${statusBg}`}>
      <div className="flex items-center justify-between gap-4">
        <span className={statusColor}>
          {current === 0
            ? `${min}-${max} characters`
            : isBelowMin
              ? `${neededMin} more characters needed`
              : isAboveMax
                ? `${current - max} characters over limit`
                : `${remaining} characters remaining`}
        </span>
        <span className={`font-mono ${statusColor}`}>
          {current}/{max}
        </span>
      </div>
    </div>
  )
}
