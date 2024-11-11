/// <reference path="./integer-calculator.ts" />

type D = {
	Zero: Zero;
	One: One;
	Two: Add<One, D['One']>;
	Three: Add<One, D['Two']>;
	Four: Add<One, D['Three']>;
	Five: Add<One, D['Four']>;
	Six: Add<One, D['Five']>;
	Seven: Add<One, D['Six']>;
	Eight: Add<One, D['Seven']>;
	Nine: Add<One, D['Eight']>;
};

type N = {
	Ten: Add<One, D['Nine']>;
};
