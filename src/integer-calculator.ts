type BZero = false;
type BOne = true;
type TypeNumber = Array<boolean>;
type ToTypeNumber<A> = A extends true ? [true] : [];
type ToRealNumber<A extends TypeNumber> = A['length'];

type Zero = ToTypeNumber<BZero>;
type One = ToTypeNumber<BOne>;

type Add<A extends TypeNumber, B extends TypeNumber> = [...A, ...B];
type Sub<A extends TypeNumber, B extends TypeNumber> = A extends [
	...B,
	...infer Res,
]
	? Res
	: Zero;

type Multiply<A extends TypeNumber, B extends TypeNumber> = B extends [
	boolean,
	...infer S,
]
	? S extends TypeNumber
		? Add<Multiply<A, S>, A>
		: []
	: [];

type Divide<
	A extends TypeNumber,
	B extends TypeNumber,
	Res extends TypeNumber = Zero,
> = A extends [...B, ...infer T]
	? T extends TypeNumber
		? Divide<T, B, Add<Res, One>>
		: Res
	: Res;

type Modulo<T extends TypeNumber, U extends TypeNumber> = T extends [
	...U,
	...infer S,
]
	? S extends TypeNumber
		? Modulo<S, U>
		: T
	: T;
