import { testFn } from '../../src/main'

it('可以正常相加', () => {
    const result = testFn(1, 2)
    expect(result).toBe(3)
})