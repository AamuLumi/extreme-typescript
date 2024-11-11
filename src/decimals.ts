/// <reference path="./integer-calculator.ts" />
/// <reference path="./utils.ts" />

type Comma = [false];

type DNumber = Array<D[keyof D]>;
type DTypeNumber = Array<TypeNumber | Comma>;

type DNumberOfDigits<
	A extends DTypeNumber,
	Result extends TypeNumber = Zero,
> = A extends [infer Digit, ...infer Rest]
	? Rest extends DTypeNumber
		? Digit extends TypeNumber
			? DNumberOfDigits<Rest, Add<Result, One>>
			: DNumberOfDigits<Rest, Result>
		: Result
	: Result;

type DResult<T extends DTypeNumber, Res extends string = ''> = T extends [
	infer N,
	...infer Rest,
]
	? Rest extends DTypeNumber
		? N extends Comma
			? DResult<Rest, `${Res},`>
			: N extends TypeNumber
				? DResult<Rest, `${Res}${ToRealNumber<N>}`>
				: never
		: never
	: Res;

//type _Add_MultipleDigits<A extends TypeNumber, B extends TypeNumber> =

// type _Add_OneDigit<A extends TypeNumber, B extends TypeNumber, Result extends DTypeNumber> =
// 	Add<A, B> extends [...infer Rest, ...N['Ten']]
// 		? Rest extends TypeNumber
// 			? [D['One'], Rest] : [[true]]
// 			: Add<A, B>;

//type TestAAAA = DResult<_Add_OneDigit<D['Nine'], D['Nine']>>;

/*
	Add 12 to 6X
 */
type _DAdd_Dozen<A extends DTypeNumber, B extends DTypeNumber> = {};

type _DAdd_Dozen_If_Needed<
	Result extends DTypeNumber,
	NumberToAdd extends DNumber,
> = Result['length'] extends NumberToAdd['length'] ? Result : Result;

/*
 	 27
	 54
	 
	 7
 */

type _DAdd_SameNumberOfDigits<
	A extends DTypeNumber,
	B extends DTypeNumber,
	Computation extends DTypeNumber = [],
> = A extends [infer ADigit, ...infer ARest]
	? B extends [infer BDigit, ...infer BRest]
		? ADigit extends TypeNumber
			? BDigit extends TypeNumber
				? _Add_OneDigit<ADigit, BDigit>
				: never
			: never
		: never
	: never;

type _DFillRightWithZeroUntilLengthIs<
	A extends DTypeNumber,
	TargetLength extends TypeNumber,
> =
	DNumberOfDigits<A> extends TargetLength
		? A
		: _DFillRightWithZeroUntilLengthIs<A, TargetLength>;

type _DFillRightWithZero<A extends DTypeNumber, B extends DTypeNumber> = O_GT<
	DNumberOfDigits<A>,
	DNumberOfDigits<B>,
	_DFillRightWithZeroUntilLengthIs<B, DNumberOfDigits<A>>,
	_DFillRightWithZeroUntilLengthIs<A, DNumberOfDigits<B>>
>;

type DAdd<A extends DTypeNumber, B extends DTypeNumber> = A extends [
	...infer APreComma,
	Comma,
	...infer APostComma,
]
	? B extends [...infer BPreComma, Comma, ...infer BPostComma]
		? // A and B are decimals
			_DFillRightWithZero<APostComma, BPostComma>
		: // A is decimal and B is integer
			never
	: B extends [...infer BPreComma, Comma, ...infer BPostComma]
		? // A is integer and B is decimal
			never
		: // A and B are integer
			never;

type DTest1 = [D['Nine'], Comma, D['Seven']];
type DTest2 = [D['One'], D['Seven'], Comma, D['Four'], D['Five']];

type Test2 = DResult<DTest1>;

type D2T<T extends DTypeNumber> = T[keyof T] extends TypeNumber
	? ToRealNumber<T[keyof T]>
	: null;

type T3 = D2T<DTest1>;
type T4 = T3[0];

type T2 = ToRealNumber<DTest1[0]>;
type Test = DResult<DTest1>;
