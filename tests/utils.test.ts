import { describe, it, expect } from 'vitest'
import { formatCurrency, formatSignedCurrency, formatDate, formatMonthYear, cn } from '@/app/lib/utils'
import { generateCSV } from '@/app/lib/csv'
import type { Expense } from '@/app/types'

describe('formatCurrency', () => {
  it('formats USD correctly', () => {
    expect(formatCurrency(100, 'USD')).toBe('$100.00')
    expect(formatCurrency(1234.56, 'USD')).toBe('$1,234.56')
  })

  it('formats RUB correctly', () => {
    const result = formatCurrency(1000, 'RUB')
    expect(result).to.include('1')
    expect(result).to.include('000')
    expect(result).to.include('₽')
  })

  it('respects language for USD formatting', () => {
    // In Russian locale, $ might be placed after the number
    const result = formatCurrency(100, 'USD', 'ru')
    expect(result).to.include('100,00')
    expect(result).to.include('$')
  })

  it('respects language for RUB formatting', () => {
    const result = formatCurrency(1000, 'RUB', 'en')
    expect(result).toBe('RUB 1,000.00') // en-US uses RUB code instead of symbol for RUB currency sometimes, or symbols
  })
})

describe('formatSignedCurrency', () => {
  it('adds + sign for income', () => {
    const result = formatSignedCurrency(500, 'income', 'USD')
    expect(result[0]).toBe('+')
    expect(result).to.include('$500.00')
  })

  it('adds - sign for expense', () => {
    const result = formatSignedCurrency(200, 'expense', 'USD')
    expect(result[0]).toBe('-')
    expect(result).to.include('$200.00')
  })

  it('prevents double-sign issues with negative amounts', () => {
    // If amount is negative, it should still only have one sign prefix
    const result = formatSignedCurrency(-100, 'expense', 'USD')
    expect(result).toBe('-$100.00')
    expect(result).not.to.include('--')
  })
})

describe('formatDate', () => {
  it('formats date string correctly', () => {
    const result = formatDate('2024-03-15')
    expect(result).to.include('15')
    expect(result).to.include('2024')
  })

  it('respects language for date formatting', () => {
    const result = formatDate('2024-03-15', 'ru')
    // Russian format is typically DD.MM.YYYY or similar, and month might be in Russian
    expect(result).to.include('15')
    expect(result).to.include('2024')
    // 03 is March, in Russian (genitive) it's "марта"
    expect(result).to.match(/мар/i)
  })
})

describe('formatMonthYear', () => {
  it('formats YYYY-MM correctly', () => {
    const result = formatMonthYear('2024-03')
    expect(result).to.include('March')
    expect(result).to.include('2024')
  })

  it('respects language for month-year formatting', () => {
    const result = formatMonthYear('2024-03', 'ru')
    expect(result).to.include('2024')
    expect(result).to.match(/март/i)
  })
})

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
    expect(cn('foo', false && 'bar')).toBe('foo')
    expect(cn('foo', undefined)).toBe('foo')
  })
})

describe('generateCSV', () => {
  const mockExpense: Expense = {
    id: '1',
    date: '2024-03-15',
    amount: 100.50,
    type: 'expense',
    currency: 'USD',
    category: 'Food',
    description: 'Lunch',
    createdAt: '2024-03-15T00:00:00Z',
    updatedAt: '2024-03-15T00:00:00Z',
  }

  it('generates CSV with correct headers', () => {
    const csv = generateCSV([mockExpense])
    expect(csv).to.include('Date,Type,Category,Currency,Amount,Description')
  })

  it('escapes quotes in description', () => {
    const expenseWithQuote: Expense = {
      ...mockExpense,
      description: 'Say "Hello"',
    }
    const csv = generateCSV([expenseWithQuote])
    expect(csv).to.include('Say ""Hello""')
  })

  it('handles empty array', () => {
    const csv = generateCSV([])
    expect(csv).to.include('Date,Type,Category,Currency,Amount,Description')
    expect(csv.split('\n').length).toBe(1) // only header
  })

  it('formats amount to 2 decimal places', () => {
    const csv = generateCSV([mockExpense])
    expect(csv).to.include('100.50')
  })
})