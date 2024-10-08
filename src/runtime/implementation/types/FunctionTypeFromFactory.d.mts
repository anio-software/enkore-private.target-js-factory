export type FunctionTypeFromFactory<T extends (...args:any[]) => any> = (...args:Parameters<ReturnType<T>>) => ReturnType<ReturnType<T>>
