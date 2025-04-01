document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    const closeModal = document.querySelector('.close');
    const loginBtn = document.getElementById('loginBtn');
    const userInfo = document.getElementById('userInfo');
    const usernameDisplay = document.getElementById('username');

    localStorage.clear();

    loginBtn.addEventListener('click', () => {
        modal.classList.remove('hidden');
        resetAuthForm();
    });

    closeModal.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    document.getElementById('logoutBtn').addEventListener('click', logout);

    document.getElementById('authForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (document.getElementById('loginFields').style.display !== 'none') {
            await login();
        }
    });

    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        if (document.getElementById('registerFields').style.display !== 'none') {
            await register();
        }
    });

    document.getElementById('loginTab').addEventListener('click', () => {
            document.getElementById('loginFields').style.display = 'block';
        document.getElementById('registerFields').style.display = 'none';
        document.getElementById('message').textContent = '';
    });

    document.getElementById('registerTab').addEventListener('click', () => {
        document.getElementById('loginFields').style.display = 'none';
        document.getElementById('registerFields').style.display = 'block';
        document.getElementById('message').textContent = '';
    });

    document.getElementById('allBooksBtn').addEventListener('click', fetchAllBooks);

    document.getElementById('myBooksBtn').addEventListener('click', fetchMyBooks);

    allBooksBtn.click();

    function resetAuthForm() {
        document.getElementById('loginFields').style.display = 'block';
        document.getElementById('registerFields').style.display = 'none';
        document.getElementById('message').textContent = '';
        document.getElementById('registerForm').reset();
        document.getElementById('authForm').reset();
    }

    async function login() {
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;


        try {
            const response = await fetch('http://127.0.0.1:8000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: "username="+username+"&password="+password+"&Authorization header&scope=&client_id=&client_secret="
            });

        if (!response.ok) {
                throw new Error('Ошибка авторизации: ' + response.status);
                }

        const data = await response.json();
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('email', username);

        usernameDisplay.textContent = username;
        userInfo.style.display = 'flex';
        modal.classList.add('hidden');
        loginBtn.style.display = 'none';
        fetchAllBooks();
        }
        catch (error) {
            console.error(error);
            document.getElementById('message').textContent = 'Ошибка авторизации. Проверьте логин и пароль.';
        }
    }

    async function register() {
        const name = document.getElementById('registerUsername').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        try {
            const response = await fetch('http://127.0.0.1:8000/user/create_user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body:  JSON.stringify({name, email, password}) ,
            });
            if (!response.ok) {
                    throw new Error(response.status);
                } else {
            document.getElementById('message').textContent = 'Пользователь зарегистрирован';
            }
        }

        catch (error) {
            console.error(error);
            if (error.message == 409) {
                document.getElementById('message').textContent = 'Ошибка: пользователь с таким адресом электронной почты уже зарегистрирован' ;
            } else {
            document.getElementById('message').textContent = 'Ошибка регистрации' ;
            }
        }
    }

    function logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('email');
        userInfo.style.display = 'none';
        usernameDisplay.textContent = '';
        loginBtn.style.display = 'flex';
        fetchAllBooks();
    }

});

    async function fetchAllBooks() {
        const response = await fetch('http://127.0.0.1:8000/all_books');
        const books = await response.json();

        let contentHtml = '<h2>Все книги</h2>';
        books.forEach(book => {
            contentHtml += `
                <div class="book">
                    <h3>${book.title} - ${book.author}
                        <button onclick="toggleDetails(this)">▼</button></h3>
                    <div class="details hidden">
                        <p>${book.description}</p>
                        <p>Создатель: ${book.creator}</p>
                    </div>
                </div> `;
        });

        document.getElementById('content').innerHTML = contentHtml;
    }

    async function fetchMyBooks() {
        try {
            const token = localStorage.getItem('token');
            const email = localStorage.getItem('email')

            const response = await fetch("http://127.0.0.1:8000/my_books/" + email, {
                headers: { "Authorization": "Bearer " + token },
            });
            if (!response.ok) {
                    throw new Error(response.status);
                }

            const books = await response.json();
                    let contentHtml = '<h2>Мои книги</h2>';

            books.forEach(book => {
                contentHtml += `
                    <div id="this_book" class="book">
                        <h3>${book.title} - ${book.author}
                            <button onclick="toggleDetails(this)">▼</button></h3>
                        <div class="details hidden">
                            <p>${book.description}</p>
                            <button onclick="showEditBookForm(this, ${book.id},
                            {'last_title': '${book.title}',
                            'last_author': '${book.author}',
                            'last_description': '${book.description}' })">Редактировать</button>
                            <button onclick="deleteBook(${book.id})">Удалить</button>
                        </div>
                    </div>`;
            });

            contentHtml += `<button onclick="showAddBookForm(this)">Добавить книгу</button>
                            <script src="script.js"></script>`;

            document.getElementById('content').innerHTML = contentHtml;
        }
        catch (error) {
            if (error.message == 401) {
                document.getElementById('content').innerHTML = 'Пожалуйста, авторизуйтесь!' ;
            } else {
                document.getElementById('content').innerHTML = 'Ошибка...' ;
            }
        }
    }


    function toggleDetails(button) {
        const detailsDiv = button.parentNode.nextElementSibling;
        detailsDiv.classList.toggle('hidden');
    }

    function showAddBookForm(button) {
        button.nextElementSibling.style.display = 'block';
        button.outerHTML = '';
        const addBookHtml = `
            <div id="addBookForm">
                <p>Создание книги</p>
                <textarea id="newBookTitle" placeholder="Название книги" required></textarea>
                <textarea id="newBookAuthor" placeholder="Автор книги" required></textarea>
                <textarea id="newBookDescription" placeholder="Описание книги" required></textarea>
                <button onclick="addBook()">Создать</button>
            </div>`;

        document.getElementById('content').insertAdjacentHTML('beforeend', addBookHtml);
    }

    async function addBook() {
        const token = localStorage.getItem('token');
        const creator = localStorage.getItem('email');

        const title = document.getElementById('newBookTitle').value;
        const author = document.getElementById('newBookAuthor').value;
        const description = document.getElementById('newBookDescription').value;

        await fetch("http://127.0.0.1:8000/my_books/create_book", {
            method: 'POST',
            headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" },
            body: JSON.stringify({ title, author, description, creator }),
        });


        fetchMyBooks(); // Refresh the list of books
    }

    function showEditBookForm(button, bookId, last_params_dict) {
        button.nextElementSibling.style.display = 'block';
        button.outerHTML = '';
        const editBookHtml = `
            <div id="editBookForm">
                <p>Редактирование книги ${last_params_dict.last_title} - ${last_params_dict.last_author}</p>
                <textarea id="newBookTitle" placeholder="Название книги">${last_params_dict.last_title}</textarea>
                <textarea id="newBookAuthor" placeholder="Автор книги">${last_params_dict.last_author}</textarea>
                <textarea id="newBookDescription" placeholder="Описание книги">${last_params_dict.last_description}</textarea>
                <button onclick="editBook(${bookId})">Изменить</button>
            </div>`;

        document.getElementById('this_book').insertAdjacentHTML('afterbegin', editBookHtml);
    }

    async function editBook(bookId) {
        const token = localStorage.getItem('token');
        const creator = localStorage.getItem('email');

        const title = document.getElementById('newBookTitle').value;
        const author = document.getElementById('newBookAuthor').value;
        const description = document.getElementById('newBookDescription').value;

        await fetch("http://127.0.0.1:8000/my_books/update_book/"+bookId, {
            method: 'PUT',
            headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" },
            body: JSON.stringify({ title, author, description, creator }),
        });

        fetchMyBooks();
    }

    async function deleteBook(bookId) {
        const token = localStorage.getItem('token');

        await fetch("http://127.0.0.1:8000/my_books/delete_book/" + bookId, {
            method: 'DELETE',
            headers: { "Authorization": "Bearer " + token, "Content-Type": "application/json" }
        });

        fetchMyBooks(); // Refresh the list of books
    }