/// <reference path="./integer-calculator.ts" />
/// <reference path="./sort-algorithm.ts" />
/// <reference path="./string.ts" />

namespace Brainfuck {
	/* OPERATORS */
	// + - Add one
	type P = One;

	// - - Subtract one
	type M = Add<One, P>;

	// < - Move left
	type L = Add<One, M>;

	// > - Move right
	type R = Add<One, L>;

	// . - Output
	type O = Add<One, R>;

	// , - Input
	type I = Add<One, O>;

	// [ - Jump if zero
	type J = Add<One, I>;

	// ] - Jump back if nonzero
	type B = Add<One, J>;

	type Operators = P | M | L | R | O | I | J | B;

	type MemoryCursorIsNegative = 'Memory Cursor is negative';
	type CellValueIsNegative = 'Cell Value is negative';
	type CompilerError = MemoryCursorIsNegative | CellValueIsNegative;

	type IFOP<
		Op extends Operators,
		PCase,
		MCase,
		LCase,
		RCase,
		OCase,
		ICase,
		JCase,
		BCase,
	> = IF<
		EQ<Op, P>,
		PCase,
		IF<
			EQ<Op, M>,
			MCase,
			IF<
				EQ<Op, L>,
				LCase,
				IF<
					EQ<Op, R>,
					RCase,
					IF<
						EQ<Op, O>,
						OCase,
						IF<
							EQ<Op, I>,
							ICase,
							IF<EQ<Op, J>, JCase, IF<EQ<Op, B>, BCase, never>>
						>
					>
				>
			>
		>
	>;

	type IncrementCell<
		Memory extends Array<TypeNumber>,
		CurrentCell extends TypeNumber,
	> = Memory extends [infer Current, ...infer Rest]
		? CurrentCell extends TypeNumber
			? Rest extends Array<TypeNumber>
				? IF<
						EQ<CurrentCell, Zero>,
						[Add<Memory[ToRealNumber<CurrentCell>], One>, ...Rest],
						[Current, ...IncrementCell<Rest, Sub<CurrentCell, One>>]
					>
				: never
			: never
		: [Zero];

	type DecrementCell<
		Memory extends Array<TypeNumber>,
		CurrentCell extends TypeNumber,
	> = Memory extends [infer Current, ...infer Rest]
		? CurrentCell extends TypeNumber
			? Rest extends Array<TypeNumber>
				? IF<
						EQ<CurrentCell, Zero>,
						[Sub<Memory[ToRealNumber<CurrentCell>], One>, ...Rest],
						[Current, ...DecrementCell<Rest, Sub<CurrentCell, One>>]
					>
				: never
			: never
		: [Zero];

	type AddCellIfNeeded<
		Memory extends Array<TypeNumber>,
		CurrentCell extends TypeNumber,
	> = IF<
		GTE<CurrentCell, NumberOfElements<Memory>>,
		[...Memory, Zero],
		Memory
	>;

	type Execute<
		P extends Array<Operators>,
		Memory extends Array<TypeNumber> = [Zero],
		CurrentCell extends TypeNumber = Zero,
		CurrentError extends CompilerError | null = null,
		Output extends string = '',
		LoopLevel extends TypeNumber = One,
		LoopInstructions extends Array<Array<Operators>> = [],
		SkipUntilLoopLevel extends TypeNumber = One,
	> = CurrentError extends null
		? P extends [infer Op, ...infer Rest]
			? Op extends Operators
				? IF<
						GT<LoopLevel, SkipUntilLoopLevel>,
						// Skip enables
						IF<
							EQ<Op, B>,
							Execute<
								Rest extends Array<Operators> ? Rest : [],
								Memory,
								CurrentCell,
								CurrentError,
								Output,
								Sub<LoopLevel, One>,
								LoopInstructions,
								SkipUntilLoopLevel
							>,
							IF<
								EQ<Op, J>,
								Execute<
									Rest extends Array<Operators> ? Rest : [],
									Memory,
									CurrentCell,
									CurrentError,
									Output,
									Add<LoopLevel, One>,
									LoopInstructions,
									SkipUntilLoopLevel
								>,
								Execute<
									Rest extends Array<Operators> ? Rest : [],
									Memory,
									CurrentCell,
									CurrentError,
									Output,
									LoopLevel,
									LoopInstructions,
									SkipUntilLoopLevel
								>
							>
						>,
						Execute<
							Rest extends Array<Operators> ? Rest : [],
							IFOP<
								Op,
								IncrementCell<Memory, CurrentCell>,
								IF<
									GT<Memory[ToRealNumber<CurrentCell>], Zero>,
									DecrementCell<Memory, CurrentCell>
								>,
								Memory,
								AddCellIfNeeded<Memory, Add<CurrentCell, One>>,
								Memory,
								Memory,
								Memory,
								Memory
							>,
							IFOP<
								Op,
								CurrentCell,
								CurrentCell,
								IF<
									GT<CurrentCell, Zero>,
									Sub<CurrentCell, One>
								>,
								Add<CurrentCell, One>,
								CurrentCell,
								CurrentCell,
								CurrentCell,
								CurrentCell
							>,
							IFOP<
								Op,
								null,
								IF<
									EQ<Memory[ToRealNumber<CurrentCell>], Zero>,
									CellValueIsNegative,
									null
								>,
								IF<
									EQ<CurrentCell, Zero>,
									MemoryCursorIsNegative,
									null
								>,
								null,
								null,
								null,
								null,
								null
							>,
							IF<
								EQ<Op, O>,
								`${Output}${Char[ToRealNumber<Memory[ToRealNumber<CurrentCell>]>]}`,
								Output
							>,
							IFOP<
								Op,
								LoopLevel,
								LoopLevel,
								LoopLevel,
								LoopLevel,
								LoopLevel,
								LoopLevel,
								IF<
									EQ<Memory[ToRealNumber<CurrentCell>], Zero>,
									Add<LoopLevel, One>,
									LoopLevel
								>,
								IF<
									EQ<Memory[ToRealNumber<CurrentCell>], Zero>,
									Sub<LoopLevel, One>,
									LoopLevel
								>
							>,
							IFOP<
								Op,
								LoopInstructions,
								LoopInstructions,
								LoopInstructions,
								LoopInstructions,
								LoopInstructions,
								LoopInstructions,
								[...LoopInstructions, never],
								[...LoopInstructions, never]
							>,
							IF<
								EQ<Op, J>,
								IF<
									EQ<Memory[ToRealNumber<CurrentCell>], Zero>,
									SkipUntilLoopLevel,
									Add<LoopLevel, One>
								>,
								IF<EQ<Op, B>, Sub<LoopLevel, One>, LoopLevel>
							>
						>
					>
				: never
			: [Memory, Output]
		: CurrentError;

	type Program = [P, R, P, P, O, R, J, P, P, P, B];
	type P2 = [P, M, P, P, M];
	type Result = Execute<Program>;
	type MemoryResult = TransformedResult<Result[0]>;
	type OutputResult = Result[1];
}
