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
})

describe('formatDate', () => {
  it('formats date string correctly', () => {
    const result = formatDate('2024-03-15')
    expect(result).to.include('15')
    expect(result).to.include('2024')
  })
})

describe('formatMonthYear', () => {
  it('formats YYYY-MM correctly', () => {
    const result = formatMonthYear('2024-03')
    expect(result).to.include('March')
    expect(result).to.include('2024')
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