const baseUrl="https://coherent-sassy-flute.glitch.me/books";


function getLoginData() {
    return JSON.parse(localStorage.getItem("loginData"));
}

// -------------------- index.html --------------------
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const errorMessage = document.getElementById("errorMessage");

    if (loginForm) {
        loginForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const email = document.getElementById("email").value;
            const password = document.getElementById("password").value;

            if (email === "admin@empher.com" && password === "empher@123") {
                localStorage.setItem("loginData", JSON.stringify({ email }));
                alert("Logged in as Admin.");
                window.location.href = "admin.html";
            } else if (email === "user@empher.com" && password === "user@123") {
                localStorage.setItem("loginData", JSON.stringify({ email }));
                alert("Logged in as User.");
                window.location.href = "books.html";
            } else {
                errorMessage.textContent = "Invalid email or password.";
            }
        });
    }
});

// -------------------- admin.html --------------------
if (window.location.pathname.includes("admin.html")) {
    document.addEventListener("DOMContentLoaded", () => {
        const loginData = getLoginData();
        if (!loginData || loginData.email !== "admin@empher.com") {
            alert("Admin Not Logged In");
            window.location.href = "index.html";
        }

        const addBookForm = document.getElementById("addBookForm");
        const booksGrid = document.getElementById("booksGrid");

        // Fetch and display all books
        function loadBooks() {
            fetch(baseUrl)
                .then((response) => response.json())
                .then((books) => {
                    booksGrid.innerHTML = books
                        .map(
                            (book) => `
                            <div class="card">
                                <img src="${book.imageUrl}" alt="${book.title}">
                                <h3>${book.title}</h3>
                                <p>Author: ${book.author}</p>
                                <p>Category: ${book.category}</p>
                                <p>Status: ${book.isAvailable ? "Available" : "Not Available"}</p>
                                <button ${book.isVerified ? "disabled" : ""} class="verify-btn" data-id="${book.id}">
                                    Verify Book
                                </button>
                                <button class="delete-btn" data-id="${book.id}">Delete Book</button>
                            </div>`
                        )
                        .join("");
                });
        }

        loadBooks();

        // Add a new book
        addBookForm.addEventListener("submit", (event) => {
            event.preventDefault();
            const title = document.getElementById("title").value;
            const author = document.getElementById("author").value;
            const category = document.getElementById("category").value;

            const newBook = {
                title,
                author,
                category,
                isAvailable: true,
                isVerified: false,
                borrowedDays: null,
                imageUrl: "https://m.media-amazon.com/images/I/71ZB18P3inL._SY522.jpg",
            };

            fetch(baseUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newBook),
            })
                .then(() => {
                    alert("Book Added Successfully.");
                    loadBooks();
                });
        });

        // Handle book actions
        booksGrid.addEventListener("click", (event) => {
            const id = event.target.dataset.id;

            if (event.target.classList.contains("verify-btn")) {
                if (confirm("Are you sure to Verify..?")) {
                    fetch(`${baseUrl}${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ isVerified: true }),
                    }).then(() => loadBooks());
                }
            } else if (event.target.classList.contains("delete-btn")) {
                if (confirm("Are you sure to Delete..?")) {
                    fetch(`${baseUrl}${id}`, { method: "DELETE" }).then(() => loadBooks());
                }
            }
        });
    });
}

// -------------------- books.html --------------------
if (window.location.pathname.includes("books.html")) {
    document.addEventListener("DOMContentLoaded", () => {
        const loginData = getLoginData();
        if (!loginData || loginData.email !== "user@empher.com") {
            alert("User Not Logged In");
            window.location.href = "index.html";
        }

        const booksGrid = document.getElementById("booksGrid");

        // Load books
        function loadBooks(filter) {
            fetch(baseUrl)
                .then((response) => response.json())
                .then((books) => {
                    const filteredBooks = books.filter(filter);
                    booksGrid.innerHTML = filteredBooks
                        .map(
                            (book) => `
                            <div class="card">
                                <img src="${book.imageUrl}" alt="${book.title}">
                                <h3>${book.title}</h3>
                                <p>Author: ${book.author}</p>
                                <p>Category: ${book.category}</p>
                                <p>Status: ${book.isAvailable ? "Available" : "Not Available"}</p>
                                ${
                                    book.isAvailable
                                        ? `<button class="borrow-btn" data-id="${book.id}">Borrow Book</button>`
                                        : `<button class="return-btn" data-id="${book.id}">Return Book</button>`
                                }
                            </div>`
                        )
                        .join("");
                });
        }

        // Show available books
        document.getElementById("showAvailable").addEventListener("click", () => {
            loadBooks((book) => book.isAvailable);
        });

        // Show borrowed books
        document.getElementById("showBorrowed").addEventListener("click", () => {
            loadBooks((book) => !book.isAvailable);
        });

        // Handle borrow and return actions
        booksGrid.addEventListener("click", (event) => {
            const id = event.target.dataset.id;

            if (event.target.classList.contains("borrow-btn")) {
                const days = prompt("Enter borrowing duration (up to 10 days):");
                if (days > 0 && days <= 10) {
                    fetch(`${baseUrl}${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ borrowedDays: days, isAvailable: false }),
                    }).then(() => {
                        alert("Book Borrowed Successfully.");
                        loadBooks((book) => book.isAvailable);
                    });
                } else {
                    alert("Invalid duration.");
                }
            } else if (event.target.classList.contains("return-btn")) {
                if (confirm("Are you sure to return the book..?")) {
                    fetch(`${baseUrl}${id}`, {
                        method: "PATCH",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ borrowedDays: null, isAvailable: true }),
                    }).then(() => {
                        alert("Book Returned Successfully.");
                        loadBooks((book) => !book.isAvailable);
                    });
                }
            }
        });
    });
}

