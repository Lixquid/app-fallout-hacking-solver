import { useMemo } from "preact/compat";
import { useState } from "preact/hooks";
import { likeness } from "./lib/util";
import words from "./words.json";

/** Toggles bootstrap theme between light and dark */
function toggleDarkMode() {
    const html = document.querySelector("html");
    if (html !== null) {
        html.dataset.bsTheme =
            html.dataset.bsTheme === "dark" ? "light" : "dark";
    }
}

const flatWordList = Object.values(words).flat();
const guessRegex = /^([A-Za-z]+) (\d+)$/;

export function App() {
    const [input, setInput] = useState("");
    const [guesses, setGuesses] = useState<[word: string, likeness: number][]>(
        []
    );
    const [error, setError] = useState<string | null>(null);

    function resetAll() {
        setGuesses([]);
        setInput("");
        setError(null);
    }

    const wordsLeft = useMemo(() => {
        if (guesses.length === 0) {
            return [];
        }
        const wordLength = guesses[0][0].length;
        if (!(String(wordLength) in words)) {
            // No words of this length
            return [];
        }
        return words[String(wordLength) as keyof typeof words].filter((word) =>
            guesses.every(([g, l]) => likeness(word, g) === l)
        );
    }, [guesses]);

    const potentialWords = useMemo(() => {
        if (input === "") {
            return [];
        }
        return (guesses.length === 0 ? flatWordList : wordsLeft).filter(
            (word) => word.startsWith(input.split(" ", 1)[0].toUpperCase())
        );
    }, [input, guesses, wordsLeft]);

    function autocomplete() {
        if (potentialWords.length === 0) {
            return;
        }
        setInput(potentialWords[0]);
    }

    function addGuess() {
        if (input === "") {
            return;
        }

        const match = guessRegex.exec(input);

        // Check if the input matches the format
        if (match === null) {
            setError(
                "Guesses should be in the form: GUESS LIKENESS. For example; ARCHITECTS 3"
            );
            return;
        }

        // If we've guessed this word before, don't add it again
        if (guesses.some(([g]) => g === match[1].toUpperCase())) {
            setError("This guess has already been added");
            return;
        }

        // If the word length doesn't match the first guess, don't add it
        if (guesses.length > 0 && guesses[0][0].length !== match[1].length) {
            setError("This guess is a different length to the first guess");
            return;
        }

        setError(null);
        setGuesses((guesses) => [
            ...guesses,
            [match[1].toUpperCase(), Number(match[2])],
        ]);
        setInput("");
    }

    return (
        <div class="container mx-auto my-5">
            <div class="d-flex justify-content-between align-items-center mb-5 flex-wrap">
                <h1>Fallout Hacking Solver</h1>
                <div>
                    <button
                        class="btn btn-outline-secondary me-2"
                        onClick={toggleDarkMode}
                        title="Toggle dark mode"
                    >
                        <i class="bi bi-moon-fill" />
                    </button>
                    <a
                        href="https://lixquid.com"
                        class="btn btn-outline-primary float-end"
                    >
                        <i class="bi bi-box-arrow-up-right me-2" />
                        lixquid.com
                    </a>
                </div>
            </div>
            <small class="d-block text-muted mb-5">
                <p class="mb-1">
                    Add guesses by entering the word attempted and the reported
                    likeness, like so <code>word likeness</code>. For example,{" "}
                    <code>ARCHITECTS 3</code>.
                </p>
                <p>
                    Press <kbd>Enter</kbd> to submit the guess. Press{" "}
                    <kbd>Ctrl + Space</kbd> to autocomplete the first potential
                    word. Press <kbd>Ctrl + C</kbd> to clear the input.
                </p>
            </small>

            <div class="input-group mb-1">
                <input
                    type="text"
                    class={`form-control form-control-lg ${
                        error ? "is-invalid" : ""
                    }`}
                    placeholder="WORD LIKENESS"
                    value={input}
                    onInput={(e) =>
                        setInput((e.target as HTMLInputElement).value)
                    }
                    onKeyUp={(e) => {
                        switch (e.code) {
                            case "Enter":
                                addGuess();
                                break;
                            case "Space":
                                if (e.ctrlKey) {
                                    autocomplete();
                                    e.preventDefault();
                                }
                                break;
                            case "KeyC":
                                if (e.ctrlKey) {
                                    setInput("");
                                    e.preventDefault();
                                }
                                break;
                        }
                    }}
                />
                <button
                    class="btn btn-primary"
                    type="button"
                    onClick={addGuess}
                >
                    Add
                </button>
            </div>
            <input
                type="text"
                class="form-control form-control-sm mb-5"
                placeholder="Possible words will appear here"
                value={potentialWords.join(" ")}
                readOnly
            />
            {error && <div class="d-block invalid-feedback mb-5">{error}</div>}

            <div class="row mb-3">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h4 class="card-title mb-1">Possible words</h4>
                        </div>
                        <div class="card-body">
                            {guesses.length === 0 ? (
                                <p class="text-muted mb-0">
                                    Enter your first guess to see possible
                                    words.
                                </p>
                            ) : wordsLeft.length === 0 ? (
                                <p class="text-muted mb-0">
                                    No words match the guesses.
                                </p>
                            ) : (
                                <ul class="mb-0">
                                    {wordsLeft.map((word, i) => (
                                        <li key={i}>{word}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <h4 class="card-title mb-1">Guesses</h4>
                        </div>
                        <div class="card-body">
                            {guesses.length === 0 ? (
                                <p class="text-muted mb-0">
                                    No guesses have been added yet.
                                </p>
                            ) : (
                                <div class="card">
                                    <ul class="list-group list-group-flush">
                                        {guesses.map(([guess, likeness], i) => (
                                            <li class="list-group-item" key={i}>
                                                <div class="d-flex justify-content-between align-items-center">
                                                    <div>
                                                        <code>{guess}</code>{" "}
                                                        {likeness}
                                                    </div>
                                                    <button
                                                        class="btn btn-sm btn-outline-danger"
                                                        onClick={() =>
                                                            setGuesses(
                                                                guesses.filter(
                                                                    (_, j) =>
                                                                        i !== j
                                                                )
                                                            )
                                                        }
                                                    >
                                                        <i class="bi bi-trash" />
                                                    </button>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <button
                class="btn btn-danger"
                onClick={resetAll}
                disabled={guesses.length === 0}
            >
                Reset everything
            </button>

            <div class="mt-5 text-end">
                <a href="https://github.com/lixquid/app-fallout-hacking-solver">
                    <i class="bi bi-box-arrow-up-right me-2" />
                    Source code
                </a>
            </div>
        </div>
    );
}
