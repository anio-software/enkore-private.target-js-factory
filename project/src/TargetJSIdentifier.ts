import type {TargetIdentifier} from "@anio-software/enkore-private.spec/primitives"

type OnlyJS<T>  = T extends `js-${string}`  ? T : never
type OnlyJSX<T> = T extends `jsx-${string}` ? T : never

export type TargetJSIdentifier = OnlyJS<TargetIdentifier> | OnlyJSX<TargetIdentifier>
