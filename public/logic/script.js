document
        .getElementById("toggle-new-blog-form")
        .addEventListener("click", function () {
          var newBlogForm = document.getElementById("new-blog-form");
          if (newBlogForm.style.display === "none") {
            newBlogForm.style.display = "block";
          } else {
            newBlogForm.style.display = "none";
          }
        });
      document.querySelectorAll(".toggle-comments").forEach((btn) => {
        btn.addEventListener("click", () => {
          const commentSection = btn.nextElementSibling;
          commentSection.style.display =
            commentSection.style.display === "none" ? "block" : "none";
          btn.textContent =
            commentSection.style.display === "none"
              ? "Show Comments"
              : "Hide Comments";
        });
      });
    document.addEventListener("DOMContentLoaded", function() {
    const prevButton = document.querySelector(".prev-page");
    const nextButton = document.querySelector(".next-page");
    const currentPageSpan = document.querySelector(".current-page");
    const totalPagesSpan = document.querySelector(".total-pages");

    let currentPage = 1;
    const totalPages = parseInt(totalPagesSpan.textContent);

    // Update the page numbers initially
    updatePageNumbers();

    // Function to update the page numbers
    function updatePageNumbers() {
      currentPageSpan.textContent = currentPage;
    }

    // Event listener for "Previous" button
    prevButton.addEventListener("click", function() {
      if (currentPage > 1) {
        currentPage--;
        updatePageNumbers();
        // You can add logic here to fetch data for the previous page
      }
    });

    // Event listener for "Next" button
    nextButton.addEventListener("click", function() {
      if (currentPage < totalPages) {
        currentPage++;
        updatePageNumbers();
        // You can add logic here to fetch data for the next page
      }
    });
  });