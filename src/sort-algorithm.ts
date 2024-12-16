/// <reference path="./integer-calculator.ts" />
/// <reference path="./utils.ts" />

type Instruction = any;
type ComparisonOperator<
	A extends TypeNumber = Zero,
	B extends TypeNumber = Zero,
> = LTE<A, B> | LT<A, B> | GTE<A, B> | GT<A, B> | EQ<A, B>;
type I_DoNothing = never;

type NumberOfElements<
	A extends unknown[],
	Result extends TypeNumber = Zero,
> = A extends [infer _, ...infer Rest]
	? Rest extends unknown[]
		? NumberOfElements<Rest, Add<Result, One>>
		: NumberOfElements<Rest, Result>
	: Result;

type LTE<A extends TypeNumber, B extends TypeNumber> = B extends [
	...infer _,
	...A,
]
	? true
	: false;

type LT<A extends TypeNumber, B extends TypeNumber> = B extends [
	...infer _,
	...A,
]
	? B extends A
		? false
		: true
	: false;

type GTE<A extends TypeNumber, B extends TypeNumber> = A extends [
	...infer _,
	...B,
]
	? true
	: false;

type GT<A extends TypeNumber, B extends TypeNumber> = A extends [
	...infer _,
	...B,
]
	? A extends B
		? false
		: true
	: false;

type EQ<A extends TypeNumber, B extends TypeNumber> = A extends B
	? true
	: false;

type NEQ<A extends TypeNumber, B extends TypeNumber> = A extends B
	? false
	: true;

type IF<
	C extends ComparisonOperator,
	TrueCase extends Instruction = I_DoNothing,
	FalseCase extends Instruction = I_DoNothing,
> = C extends true ? TrueCase : FalseCase;

type _SearchIndexForElement<
	NewNumber extends TypeNumber,
	R extends Array<TypeNumber>,
	CurrentElement extends TypeNumber = R[ToRealNumber<Zero>],
> = R extends [CurrentElement, ...infer Rest]
	? IF<
			GT<NewNumber, CurrentElement>,
			Rest extends TypeNumber[]
				? [CurrentElement, ..._SearchIndexForElement<NewNumber, Rest>]
				: [...R, NewNumber],
			[NewNumber, ...R]
		>
	: [...R, NewNumber];

type SortArray<
	ArrayParam extends Array<TypeNumber>,
	Out extends Array<TypeNumber> = [],
> = IF<
	GT<NumberOfElements<ArrayParam>, Zero>,
	ArrayParam extends [infer CurrentElement, ...infer Rest]
		? Rest extends TypeNumber[]
			? CurrentElement extends TypeNumber
				? SortArray<Rest, _SearchIndexForElement<CurrentElement, Out>>
				: SortArray<Rest, Out>
			: CurrentElement extends TypeNumber
				? _SearchIndexForElement<CurrentElement, Out>
				: Out
		: Out,
	Out
>;

type X<
	ArrayParam extends Array<TypeNumber>,
	Out extends Array<TypeNumber> = [],
> = While<
	GT<NumberOfElements<ArrayParam>, Zero>,
	ArrayParam extends [infer CurrentElement, ...infer Rest]
		? Rest extends TypeNumber[]
			? CurrentElement extends TypeNumber
				? X<Rest, _SearchIndexForElement<CurrentElement, Out>>
				: X<Rest, Out>
			: CurrentElement extends TypeNumber
				? _SearchIndexForElement<CurrentElement, Out>
				: Out
		: Out
>;

type While<
	LoopCondition extends ComparisonOperator,
	LoopCase extends Instruction = I_DoNothing,
	OutCase extends Instruction = I_DoNothing,
> = LoopCondition extends true
	? While<LoopCondition, LoopCase, OutCase>
	: OutCase;

type TestArrayToSort = [
	D['Six'],
	D['One'],
	D['Five'],
	D['Three'],
	D['Eight'],
	D['One'],
];
type TransformedResult<T extends TypeNumber[]> = {
	[K in keyof T]: ToRealNumber<T[K]>;
};
type TestSort = TransformedResult<SortArray<TestArrayToSort>>;
