// Array untuk menyimpan daftar buku
const books = [];

// Event untuk merender ulang daftar buku setelah terjadi perubahan
const RENDER_EVENT = "render-book";

// Event untuk menyimpan data ke Local Storage
const SAVED_EVENT = "saved-book";

// Key untuk menyimpan data buku di Local Storage
const STORAGE_KEY = "BOOKSHELF_APPS";

// Event Listener untuk menunggu DOM dimuat, lalu menambahkan event listener ke form dan memuat data dari Local Storage jika ada
document.addEventListener("DOMContentLoaded", () => {
  const submitForm = document.getElementById("bookForm");

  // Event untuk menangani submit form buku
  submitForm.addEventListener("submit", (event) => {
    event.preventDefault();
    addBook();
  });

  // Memeriksa apakah browser mendukung Local Storage, dan memuat data jika ada
  if (isStorageExist()) {
    loadDataFromStorage();
  }
});

// Fungsi untuk menambahkan buku baru ke dalam array `books`
const addBook = () => {
  // Mengambil nilai input dari form
  const bookTitle = document.getElementById("bookFormTitle").value;
  const bookAuthor = document.getElementById("bookFormAuthor").value;

  // Mengubah input tahun (string) menjadi number menggunakan parseInt
  const bookYear = parseInt(document.getElementById("bookFormYear").value);

  const isComplete = document.getElementById("bookFormIsComplete").checked;

  // Membuat ID unik untuk buku berdasarkan waktu saat ini
  const generatedID = generateId();

  // Membuat objek buku dan menambahkannya ke array `books`
  const bookObject = generateBookObject(
    generatedID,
    bookTitle,
    bookAuthor,
    bookYear,
    isComplete
  );
  books.push(bookObject);

  // Mengirim event untuk merender ulang daftar buku dan menyimpan data
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

// Fungsi untuk menghasilkan ID unik berbasis timestamp
const generateId = () => {
  return +new Date();
};

// Fungsi untuk membuat objek buku dengan properti id, title, author, year, dan isComplete
const generateBookObject = (id, title, author, year, isComplete) => {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
};

// Event listener untuk menangani rendering ulang daftar buku setiap kali ada perubahan
document.addEventListener(RENDER_EVENT, () => {
  const incompleteBookList = document.getElementById("incompleteBookList");
  const completeBookList = document.getElementById("completeBookList");

  // Mengosongkan isi list buku sebelum merender ulang
  incompleteBookList.innerHTML = "";
  completeBookList.innerHTML = "";

  // Memisahkan buku berdasarkan status `isComplete` dan merendernya ke rak yang sesuai
  for (const bookItem of books) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isComplete) {
      incompleteBookList.append(bookElement);
    } else {
      completeBookList.append(bookElement);
    }
  }
});

// Fungsi untuk membuat elemen HTML untuk setiap buku
const makeBook = (bookObject) => {
  // Membuat elemen judul buku
  const textTitle = document.createElement("h3");
  textTitle.innerText = bookObject.title;
  textTitle.setAttribute("data-testid", "bookItemTitle");

  // Membuat elemen penulis buku
  const textAuthor = document.createElement("p");
  textAuthor.innerText = `Penulis: ${bookObject.author}`;
  textAuthor.setAttribute("data-testid", "bookItemAuthor");

  // Membuat elemen tahun buku
  const textYear = document.createElement("p");
  textYear.innerText = `Tahun: ${bookObject.year}`;
  textYear.setAttribute("data-testid", "bookItemYear");

  // Membuat container untuk buku dan menambahkan elemen judul, penulis, dan tahun
  const container = document.createElement("div");
  container.classList.add("book_item");
  container.setAttribute("data-bookid", bookObject.id);
  container.setAttribute("data-testid", "bookItem");
  container.append(textTitle, textAuthor, textYear);

  const buttonContainer = document.createElement("div");
  buttonContainer.classList.add("action");

  // Jika buku sudah selesai dibaca, tambahkan tombol "Belum Selesai Dibaca" dan "Hapus"
  if (bookObject.isComplete) {
    const undoButton = document.createElement("button");
    undoButton.innerText = "Belum Selesai Dibaca";
    undoButton.classList.add("green");
    undoButton.setAttribute("data-testid", "bookItemIsCompleteButton");

    // Tambahkan event listener untuk mengubah status buku menjadi belum selesai dibaca
    undoButton.addEventListener("click", () => {
      undoBookFromCompleted(bookObject.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Hapus Buku";
    deleteButton.classList.add("red");
    deleteButton.setAttribute("data-testid", "bookItemDeleteButton");

    // Event listener untuk menghapus buku dari daftar
    deleteButton.addEventListener("click", () => {
      deleteBookFromComplete(bookObject.id);
    });

    buttonContainer.append(undoButton, deleteButton);
  } else {
    // Jika buku belum selesai dibaca, tambahkan tombol "Selesai Dibaca" dan "Hapus"
    const finishButton = document.createElement("button");
    finishButton.innerText = "Selesai Dibaca";
    finishButton.classList.add("green");
    finishButton.setAttribute("data-testid", "bookItemIsCompleteButton");

    // Event listener untuk mengubah status buku menjadi selesai dibaca
    finishButton.addEventListener("click", () => {
      addBookToCompleted(bookObject.id);
    });

    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Hapus Buku";
    deleteButton.classList.add("red");
    deleteButton.setAttribute("data-testid", "bookItemDeleteButton");

    // Event listener untuk menghapus buku
    deleteButton.addEventListener("click", () => {
      deleteBookFromComplete(bookObject.id);
    });

    buttonContainer.append(finishButton, deleteButton);
  }

  container.append(buttonContainer);
  return container;
};

// Fungsi untuk mengubah status buku menjadi selesai dibaca
const addBookToCompleted = (bookId) => {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

// Fungsi untuk mengubah status buku menjadi belum selesai dibaca
const undoBookFromCompleted = (bookId) => {
  const bookTarget = findBook(bookId);
  if (bookTarget == null) return;

  bookTarget.isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

// Fungsi untuk menghapus buku dari daftar
const deleteBookFromComplete = (bookId) => {
  const bookTargetIndex = findBookIndex(bookId);
  if (bookTargetIndex === -1) return;

  books.splice(bookTargetIndex, 1);
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveData();
};

// Fungsi untuk mencari buku berdasarkan ID
const findBook = (bookId) => {
  for (const bookItem of books) {
    if (bookItem.id === bookId) {
      return bookItem;
    }
  }
  return null;
};

// Fungsi untuk mencari index buku berdasarkan ID
const findBookIndex = (bookId) => {
  for (const index in books) {
    if (books[index].id === bookId) {
      return index;
    }
  }
  return -1;
};

// Fungsi untuk menyimpan data buku ke Local Storage
const saveData = () => {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
};

// Fungsi untuk memeriksa apakah browser mendukung Local Storage
const isStorageExist = () => {
  if (typeof Storage === undefined) {
    alert("Browser kamu tidak mendukung local storage");
    return false;
  }
  return true;
};

// Fungsi untuk memuat data buku dari Local Storage jika ada
const loadDataFromStorage = () => {
  const serializedData = localStorage.getItem(STORAGE_KEY);
  let data = JSON.parse(serializedData);

  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }

  document.dispatchEvent(new Event(RENDER_EVENT));
};
