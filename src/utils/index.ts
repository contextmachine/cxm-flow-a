

export const groupBy = <T, U>(list: T[], keyGetter: (value: T) => U): Map<U, T[]> => {
    const grouped = new Map<U, T[]>()
    for (const item of list) {
        const key = keyGetter(item)
        const rec = grouped.get(key)
        if (rec) {
            rec.push(item)
        } else {
            grouped.set(key, [item])
        }
    }
    return grouped
}


export function assertionError(description: string) {
    return new Error(`Assertion error: ${description}`)
}

export const assertDefined = <T>(value: T | undefined | null, name = ''): T => {
    if (value === undefined || value === null) {
        throw assertionError(`assertDefined failed ${name}`)
    }
    return value
}

export const filterPartial = <T>(object: Partial<T>): Partial<T> => {
    const result = Object.fromEntries(Object.entries(object).filter(([_, v]) => v !== undefined))
    return result as Partial<T>
}

export function exhaustiveCheck(object: never): never {
    throw appLogicError(`exhaustiveCheck for ${object} failed`)
}

export function appLogicError(description: string) {
    return new Error(`Application logic error: ${description}`)
}

export const mapNumRange = (num: number, inMin: number, inMax: number, outMin: number, outMax: number) =>
    ((num - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;

