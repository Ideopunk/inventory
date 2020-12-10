for (let i = 0; i < 101; i++) {
	let text = "";

	if (i % 3 === 0) text += "Fizz";
	if (i % 5 === 0) text += "Buzz";
	if (i % 3 !== 0 && i % 5 !== 0) text += i;

	console.log(text);
}
