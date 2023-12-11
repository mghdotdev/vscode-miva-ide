import { CompletionItemKind } from 'vscode-languageserver';
import { BaseOperatorData, OperatorData } from '../util/interfaces';

// Base object references

const baseOperator: BaseOperatorData = {
	insertTextFormat: 'Snippet',
	kind: CompletionItemKind.Operator,
	commitCharacters: [],
	reference: 'https://www.mivascript.com/topic/operators.html'
};

export default {
	and: {
		...baseOperator,
		documentation: 'Return true of any condition is true.',
		example: [
			'```mv',
			`l.expr1 = 1`,
			`l.expr2 = 0`,
			'{ l.expr1 AND l.expr2 } = 0',
			'```',
			'',
			'---'
		].join('\n'),
		label: 'AND',
		detail: 'Logical And'
	},
	not: {
		...baseOperator,
		documentation: 'Returns the opposite of the next expression.',
		example: [
			'```mv',
			'l.expr1 = 0',
			'{ NOT l.expr1 } = 1',
			'```',
			'',
			'---'
		].join('\n'),
		label: 'NOT',
		detail: 'Logical Not'
	},
	or: {
		...baseOperator,
		documentation: 'Returns true if any condition is true.',
		example: [
			'```mv',
			`l.expr1 = 1`,
			`l.expr2 = 0`,
			`{ l.expr1 OR l.expr2 } = 1`,
			'```',
			'',
			'---'
		].join('\n'),
		label: 'OR',
		detail: 'Logical Or'
	},
	isnull: {
		...baseOperator,
		documentation: 'Returns true if the value tested is null or an empty string.',
		example: [
			'```mv',
			`l.expr1 = ''`,
			`{ ISNULL l.expr1 } = 1`,
			'```',
			'',
			'---'
		].join('\n'),
		label: 'ISNULL',
		detail: 'Tests if null'
	},
	eq: {
		...baseOperator,
		documentation: 'Tests if two expressions are equal to each other.',
		example: [
			'```mv',
			`l.expr1 = 1`,
			`l.expr2 = 2`,
			`{ l.expr1 EQ l.expr2 } = 0`,
			'```',
			'',
			'---'
		].join('\n'),
		label: 'EQ',
		detail: 'Equal to'
	},
	gt: {
		...baseOperator,
		documentation: 'Tests if the previous expression is greater than the next expression.',
		example: [
			'```mv',
			`l.expr1 = 1`,
			`l.expr2 = 2`,
			`{ l.expr1 GT l.expr2 } = 0`,
			'```',
			'',
			'---'
		].join('\n'),
		label: 'GT',
		detail: 'Greater than'
	},
	lt: {
		...baseOperator,
		documentation: 'Tests if the previous expression is less than the next expression.',
		example: [
			'```mv',
			`l.expr1 = 1`,
			`l.expr2 = 2`,
			`{ l.expr1 LT l.expr2 } = 1`,
			'```',
			'',
			'---'
		].join('\n'),
		label: 'LT',
		detail: 'Less than'
	},
	ne: {
		...baseOperator,
		documentation: 'Tests if the previous expression is not equal to the next expression.',
		example: [
			'```mv',
			`l.expr1 = 1`,
			`l.expr2 = 2`,
			`{ l.expr1 NE l.expr2 } = 1`,
			'```',
			'',
			'---'
		].join('\n'),
		label: 'NE',
		detail: 'Not equal to'
	},
	ge: {
		...baseOperator,
		documentation: 'Tests if the previous expression is greater than or equal to the next expression.',
		example: [
			'```mv',
			`l.expr1 = 1`,
			`l.expr2 = 2`,
			`{ l.expr1 GE l.expr2 } = 0`,
			'```',
			'',
			'---'
		].join('\n'),
		label: 'GE',
		detail: 'Greater than or equal to'
	},
	le: {
		...baseOperator,
		documentation: 'Tests if the previous expression is less than or equal to the next expression.',
		example: [
			'```mv',
			`l.expr1 = 1`,
			`l.expr2 = 2`,
			`{ l.expr1 LE l.expr2 } = 1`,
			'```',
			'',
			'---'
		].join('\n'),
		label: 'LE',
		detail: 'Less than or equal to'
	},
	pow: {
		...baseOperator,
		documentation: 'Raise the previous expression to the power of the next expression.',
		example: [
			'```mv',
			`{ 5 POW 2 } = 25`,
			'```',
			'',
			'---'
		].join('\n'),
		label: 'POW',
		detail: 'Power'
	},
	mod: {
		...baseOperator,
		documentation: 'Returns the integer remainder from the previous and next expression.',
		example: [
			'```mv',
			`{ 5 MOD 2 } = 1`,
			'```',
			'',
			'---'
		].join('\n'),
		label: 'MOD',
		detail: 'Modulus'
	},
	round: {
		...baseOperator,
		documentation: `Rounds the previous expression (numeric) up or down to the next expressions (numeric)`,
		example: [
			'```mv',
			`{ 1.494 ROUND 2 } = 1.49`,
			'```',
			'',
			'---'
		].join('\n'),
		label: 'ROUND',
		detail: 'Number Rounding'
	},
	in: {
		...baseOperator,
		documentation: `Case sensitive search for expr1 contained in expr2 returns the position of the first matching character in expr2. If no match is found returns 0.`,
		example: [
			'```mv',
			`{ 'l' IN 'Hello World' } = 3`,
			'```',
			'',
			'---'
		].join('\n'),
		label: 'IN',
		detail: 'Case Sensitive Starting String Position'
	},
	cin: {
		...baseOperator,
		documentation: `Case insensitive search for expr1 contained in expr2 returns the position of the first matching character in expr2. If no match is found returns 0.`,
		example: [
			'```mv',
			`{ 'L' CIN 'Hello World' } = 3`,
			'```',
			'',
			'---'
		].join('\n'),
		label: 'CIN',
		detail: 'Case Insensitive Starting String Position'
	},
	ein: {
		...baseOperator,
		documentation: `Case sensitive search for expr1 contained in expr2 returns the position of the last matching character in expr2. If no match is found returns 0.`,
		example: [
			'```mv',
			`{ 'l' EIN 'Hello World' } = 10`,
			'```',
			'',
			'---'
		].join('\n'),
		label: 'EIN',
		detail: 'Case Sensitive Ending String Position'
	},
	ecin: {
		...baseOperator,
		documentation: `Case insensitive search for expr1 contained in expr2 returns the position of the last matching character in expr2. If no match is found returns 0.`,
		example: [
			'```mv',
			`{ 'L' ECIN 'Hello World' } = 10`,
			'```',
			'',
			'---'
		].join('\n'),
		label: 'ECIN',
		detail: 'Case Insensitive Ending String Position'
	},
	crypt: {
		...baseOperator,
		documentation: `Performs a one-way encryption. The string_expression is encrypted using the string_key. The first eight characters of string_expression and the first two characters of key is used in the encryption. CRYPT always yields the same result when applied to a particular expression and key.`,
		example: [
			'```mv',
			`{ l.string_expression CRYPT l.string_key }`,
			'```',
			'',
			'---'
		].join('\n'),
		label: 'CRYPT',
		detail: 'Encrypt a String'
	},
	bitand: {
		...baseOperator,
		documentation: `Perform a logical AND on the bits of expr1 and expr2.`,
		example: [
			'```mv',
			`{ l.expr1 BITAND l.expr2 }`,
			'```',
			'',
			'---'
		].join('\n'),
		label: 'BITAND',
		detail: 'Bitwise And'
	},
	bitor: {
		...baseOperator,
		documentation: `Perform a logical OR on the bits of expr1 and expr2.`,
		example: [
			'```mv',
			`{ l.expr1 BITOR l.expr2 }`,
			'```',
			'',
			'---'
		].join('\n'),
		label: 'BITOR',
		detail: 'Bitwise Or'
	},
	bitxor: {
		...baseOperator,
		documentation: `Perform a logical exclusive OR on the bits of expr1 and expr2 (return the number whose bits are equal to 1 in either, but not both, of the original numbers).`,
		example: [
			'```mv',
			`{ l.expr1 BITXOR l.expr2 }`,
			'```',
			'',
			'---'
		].join('\n'),
		label: 'BITXOR',
		detail: 'Bitwise Exclusive Or'
	},
	bitoc: {
		...baseOperator,
		documentation: `BITOC expr Flip the bits of expr (including the 'sign bit'). This operator is unary: it acts on one number, not two. Example: {BITOC 9}. 9 in binary form is '1001'; including the 'sign bit' (left most bit), which indicates that the number is positive, it is '01001'. Flipping these bits gives '10110'. Since the sign bit is now '1', the number is negative. According to the rules of binary arithmetic, '0110' interpreted as a negative number is '-10'.`,
		example: [
			'```mv',
			`{ BITOC l.expr }`,
			'```',
			'',
			'---'
		].join('\n'),
		label: 'BITOC',
		detail: 'Bitwise Ones Complement'
	},
	bitsl: {
		...baseOperator,
		documentation: `expr1 BITSL expr2 Shift the bits of expr1 to the left by expr2 places. The leftmost bits are lost, and the rightmost bits are replaced by zeroes.'{23 BITSL 2}' is interpreted as follows: 23 is 00010111 in binary form; shifting these bits left two places gives 01011100, or 92 in decimal format.`,
		example: [
			'```mv',
			`{ l.expr1 BITSL l.expr2 }`,
			'```',
			'',
			'---'
		].join('\n'),
		label: 'BITSL',
		detail: 'Bitwise Shift Left'
	},
	bitsr: {
		...baseOperator,
		documentation: `expr1 BITSR expr2 Shift the bits of expr1 to the right by expr2 places. The rightmost bits are lost, and the leftmost bits are replaced by zeroes.`,
		example: [
			'```mv',
			`{ l.expr1 BITSR l.expr2 }`,
			'```',
			'',
			'---'
		].join('\n'),
		label: 'BITSR',
		detail: 'Bitwise Shift Right'
	},
} as Record<string, OperatorData>;

