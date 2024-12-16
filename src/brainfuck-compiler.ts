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
	> =
		EQ<Op, P> extends true
			? PCase
			: EQ<Op, M> extends true
				? MCase
				: EQ<Op, L> extends true
					? LCase
					: EQ<Op, R> extends true
						? RCase
						: EQ<Op, O> extends true
							? OCase
							: EQ<Op, I> extends true
								? ICase
								: EQ<Op, J> extends true
									? JCase
									: EQ<Op, B> extends true
										? BCase
										: never;

	type IncrementCell<
		Memory extends Array<TypeNumber>,
		CurrentCell extends TypeNumber,
	> = Memory extends [
		infer Current extends TypeNumber,
		...infer Rest extends Array<TypeNumber>,
	]
		? IF<
				EQ<CurrentCell, Zero>,
				[Add<Memory[ToRealNumber<CurrentCell>], One>, ...Rest],
				[Current, ...IncrementCell<Rest, Sub<CurrentCell, One>>]
			>
		: [Zero];

	type DecrementCell<
		Memory extends Array<TypeNumber>,
		CurrentCell extends TypeNumber,
	> = Memory extends [
		infer Current extends TypeNumber,
		...infer Rest extends Array<TypeNumber>,
	]
		? IF<
				EQ<CurrentCell, Zero>,
				[Sub<Memory[ToRealNumber<CurrentCell>], One>, ...Rest],
				[Current, ...DecrementCell<Rest, Sub<CurrentCell, One>>]
			>
		: [Zero];

	type AddCellIfNeeded<
		Memory extends Array<TypeNumber>,
		CurrentCell extends TypeNumber,
	> = IF<
		GTE<CurrentCell, NumberOfElements<Memory>>,
		[...Memory, Zero],
		Memory
	>;

	type PushInsUntilIndex<
		LoopArray extends Array<Array<Operators>>,
		Index extends TypeNumber,
		Ins extends Operators,
	> = LoopArray extends [
		infer LoopIns extends Array<Operators>,
		...infer Rest extends Array<Array<Operators>>,
	]
		? EQ<Index, Zero> extends true
			? [[...LoopIns, Ins], ...Rest]
			: [
					[...LoopIns, Ins],
					...PushInsUntilIndex<Rest, Sub<Index, One>, Ins>,
				]
		: LoopArray extends [infer LoopIns extends Array<Operators>]
			? EQ<Index, Zero> extends true
				? [[...LoopIns, Ins]]
				: [
						[...LoopIns, Ins],
						...PushInsUntilIndex<[], Sub<Index, One>, Ins>,
					]
			: // Replacing this ternary by IF is too deep -> Bug from TS
				//   because it doesn't resolve correctly the result of IF ?
				EQ<Index, Zero> extends true
				? [[Ins], ...PushInsUntilIndex<[], Sub<Index, One>, Ins>]
				: [[Ins]];

	type C = PushInsUntilIndex<[[]], Zero, P>;
	type D = PushInsUntilIndex<[], One, P>;
	type E = PushInsUntilIndex<[[]], Add<One, One>, P>;
	type F = PushInsUntilIndex<[[], [P]], Zero, P>;

	type DeleteIndex<
		LoopArray extends Array<Array<Operators>>,
		Index extends TypeNumber,
	> = LoopArray extends [infer LoopIns, ...infer Rest]
		? IF<
				EQ<Index, Zero>,
				[[], ...Rest],
				Rest extends Array<Array<Operators>>
					? [LoopIns, ...DeleteIndex<Rest, Sub<Index, One>>]
					: [LoopIns]
			>
		: [[]];

	type RemoveFirstElement<Current extends Array<any>> = Current extends [
		infer _,
		...infer Elements,
	]
		? Elements
		: [];

	type RemoveLastElement<Current extends Array<any>> = Current extends [
		...infer Elements,
		infer _,
	]
		? Elements
		: [];

	type GetProgramFromIndex<
		Program extends Array<Operators>,
		CurrentIndex extends TypeNumber,
	> =
		EQ<CurrentIndex, Zero> extends true
			? Program
			: GetProgramFromIndex<
					Program extends [
						infer _,
						...infer Elements extends Array<Operators>,
					]
						? Elements
						: [],
					Sub<CurrentIndex, One>
				>;

	type Execute<
		P extends Array<Operators>,
		Memory extends Array<TypeNumber> = [Zero],
		CurrentCell extends TypeNumber = Zero,
		CurrentError extends CompilerError | null = null,
		Output extends string = '',
		LoopLevel extends TypeNumber = One,
		SkipUntilLoopLevel extends TypeNumber = One,
		InitialProgram extends Array<Operators> = P,
		CurrentProgramIndex extends TypeNumber = Zero,
		LoopBackPointers extends Array<TypeNumber> = [Zero, Zero],
	> = CurrentError extends null
		? P extends [infer Op extends Operators, ...infer Rest]
			? GT<LoopLevel, SkipUntilLoopLevel> extends true
				? // Skip enables
					EQ<Op, B> extends true
					? Execute<
							Rest extends Array<Operators> ? Rest : [],
							Memory,
							CurrentCell,
							CurrentError,
							Output,
							Sub<LoopLevel, One>,
							SkipUntilLoopLevel,
							InitialProgram,
							Add<CurrentProgramIndex, One>,
							LoopBackPointers
						>
					: EQ<Op, J> extends true
						? Execute<
								Rest extends Array<Operators> ? Rest : [],
								Memory,
								CurrentCell,
								CurrentError,
								Output,
								Add<LoopLevel, One>,
								SkipUntilLoopLevel,
								InitialProgram,
								Add<CurrentProgramIndex, One>,
								LoopBackPointers
							>
						: Execute<
								Rest extends Array<Operators> ? Rest : [],
								Memory,
								CurrentCell,
								CurrentError,
								Output,
								LoopLevel,
								SkipUntilLoopLevel,
								InitialProgram,
								Add<CurrentProgramIndex, One>,
								LoopBackPointers
							>
				: // Not skipping
					Execute<
						Rest extends Array<Operators>
							? EQ<Op, B> extends true
								? Memory[ToRealNumber<CurrentCell>] extends Zero
									? Rest
									: GetProgramFromIndex<
											InitialProgram,
											LoopBackPointers[ToRealNumber<LoopLevel>]
										>
								: Rest
							: [],
						IFOP<
							Op,
							IncrementCell<Memory, CurrentCell>,
							GT<
								Memory[ToRealNumber<CurrentCell>],
								Zero
							> extends true
								? DecrementCell<Memory, CurrentCell>
								: Memory,
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
							GT<CurrentCell, Zero> extends true
								? Sub<CurrentCell, One>
								: CurrentCell,
							Add<CurrentCell, One>,
							CurrentCell,
							CurrentCell,
							CurrentCell,
							CurrentCell
						>,
						IFOP<
							Op,
							null,
							EQ<
								Memory[ToRealNumber<CurrentCell>],
								Zero
							> extends true
								? CellValueIsNegative
								: null,
							EQ<CurrentCell, Zero> extends true
								? MemoryCursorIsNegative
								: null,
							null,
							null,
							null,
							null,
							null
						>,
						EQ<Op, O> extends true
							? `${Output}${Char[ToRealNumber<Memory[ToRealNumber<CurrentCell>]>]}`
							: Output,
						// LoopLevel
						IFOP<
							Op,
							LoopLevel,
							LoopLevel,
							LoopLevel,
							LoopLevel,
							LoopLevel,
							LoopLevel,
							EQ<
								Memory[ToRealNumber<CurrentCell>],
								Zero
							> extends true
								? LoopLevel
								: Add<LoopLevel, One>,
							EQ<
								Memory[ToRealNumber<CurrentCell>],
								Zero
							> extends true
								? Sub<LoopLevel, One>
								: LoopLevel
						>,
						// SkipUntilLoopLevel
						EQ<Op, J> extends true
							? EQ<
									Memory[ToRealNumber<CurrentCell>],
									Zero
								> extends true
								? SkipUntilLoopLevel
								: Add<LoopLevel, One>
							: EQ<Op, B> extends true
								? EQ<
										Memory[ToRealNumber<CurrentCell>],
										Zero
									> extends true
									? Sub<LoopLevel, One>
									: LoopLevel
								: LoopLevel,
						InitialProgram,
						EQ<Op, B> extends true
							? EQ<
									Memory[ToRealNumber<CurrentCell>],
									Zero
								> extends true
								? Add<CurrentProgramIndex, One>
								: LoopBackPointers[ToRealNumber<LoopLevel>]
							: Add<CurrentProgramIndex, One>,
						EQ<Op, J> extends true
							? [
									...LoopBackPointers,
									Add<CurrentProgramIndex, One>,
								]
							: EQ<Op, B> extends true
								? EQ<
										Memory[ToRealNumber<CurrentCell>],
										Zero
									> extends true
									? RemoveLastElement<LoopBackPointers>
									: LoopBackPointers
								: LoopBackPointers
					>
			: [Memory, Output, LoopLevel, LoopBackPointers]
		: CurrentError;

	// prettier-ignore
	type Program = [
		// First letter
		P, P, P, P, J, R, P, P, P, P, J, R, P, P, P, P, L, M, B, L, M, B, R, R, P, P, P, O, L, L,
		// Second letter	
		P, P, P, P, J, R, P, P, P, P, J, R, P, P, L, M, B, L, M, B, R, R, P, P, P, P, P, O,	
		// Third letter
		M, M, M, O,	
		// Fourth letter,
		P, P, P, O,
	];
	type P1 = [P, P, J, R, P, P, P, P, L, M, B];
	type P2 = [P, M, B];
	type Result = Execute<Program>;
	type MemoryResult = TransformedResult<Result[0]>;
	type OutputResult = Result[1];
}
