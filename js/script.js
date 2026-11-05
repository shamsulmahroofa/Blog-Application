
// ==========================================
// 1. CREATE AND EDIT BLOG
// ==========================================

const blogForm = document.getElementById("blogForm");

if (blogForm) {

    const titleInput = document.getElementById("blogTitle");
    const categoryInput = document.getElementById("category");
    const imageInput = document.getElementById("coverImage");
    const contentInput = document.getElementById("blogContent");

    const submitButton = blogForm.querySelector(
        'button[type="submit"]'
    );

    const editorHeading = document.getElementById("editorHeading");
    const editorSubtitle = document.getElementById("editorSubtitle");

    // Check whether we are editing an existing blog
    const editBlogId = localStorage.getItem("editBlogId");

    let blogs = JSON.parse(localStorage.getItem("blogs")) || [];

    if (editBlogId) {

        const blogToEdit = blogs.find(
            blog => String(blog.id) === editBlogId
        );

        if (blogToEdit) {

            // Fill form with existing blog details
            titleInput.value = blogToEdit.title;
            categoryInput.value = blogToEdit.category;
            imageInput.value = blogToEdit.image;
            contentInput.value = blogToEdit.content;

            // Change button text
            if (submitButton) {
                submitButton.textContent = "Update Blog";
            }

            blogForm.classList.add("is-editing");

            if (editorHeading) {
                editorHeading.textContent = "Update your story";
            }

            if (editorSubtitle) {
                editorSubtitle.textContent = "Revise the post, then save the latest version to your library.";
            }

        } else {
            localStorage.removeItem("editBlogId");
        }
    }

    // Handle form submission
    blogForm.addEventListener("submit", function(event) {

        event.preventDefault();

        // Get form values
        const title = titleInput.value.trim();
        const category = categoryInput.value;
        const image = imageInput.value.trim();
        const content = contentInput.value.trim();

        if (!title || !category || !content) {
            alert("Please fill in all required fields.");
            return;
        }

        // Check whether this is an edit or a new blog
        const currentEditId = localStorage.getItem("editBlogId");

        if (currentEditId) {

            // Update existing blog
            const updatedBlogs = blogs.map(function(blog) {

                if (String(blog.id) === currentEditId) {

                    return {
                        ...blog,
                        title: title,
                        category: category,
                        image: image,
                        content: content,
                        date: new Date().toLocaleDateString()
                    };

                }

                return blog;

            });

            localStorage.setItem(
                "blogs",
                JSON.stringify(updatedBlogs)
            );

            // Clear editing information
            localStorage.removeItem("editBlogId");

            alert("Your blog has been updated successfully!");

        } else {

            // Create a new blog
            const newBlog = {
                id: Date.now(),
                title: title,
                category: category,
                image: image,
                content: content,
                status: "Published",
                date: new Date().toLocaleDateString()
            };

            blogs.push(newBlog);

            localStorage.setItem(
                "blogs",
                JSON.stringify(blogs)
            );

            alert("Your blog has been published successfully!");

        }

        // Redirect to Dashboard
        window.location.href = "dashboard.html";

    });

}


// ==========================================
// 2. DASHBOARD - DISPLAY, EDIT AND DELETE
// ==========================================

const blogList = document.getElementById("blogList");

if (blogList) {

    const blogs = JSON.parse(localStorage.getItem("blogs")) || [];

    // Get statistics elements
    const totalBlogs = document.getElementById("totalBlogs");
    const publishedBlogs = document.getElementById("publishedBlogs");
    const draftBlogs = document.getElementById("draftBlogs");

    // Update statistics
    if (totalBlogs) {
        totalBlogs.textContent = blogs.length;
    }

    if (publishedBlogs) {
        publishedBlogs.textContent =
            blogs.filter(blog => blog.status === "Published").length;
    }

    if (draftBlogs) {
        draftBlogs.textContent =
            blogs.filter(blog => blog.status === "Draft").length;
    }

    // Clear existing blog list
    blogList.innerHTML = "";

    if (blogs.length === 0) {
        const emptyState = document.createElement("div");
        emptyState.className = "empty-state";

        const emptyTitle = document.createElement("h3");
        emptyTitle.textContent = "No blog posts yet";

        const emptyText = document.createElement("p");
        emptyText.textContent = "Create your first story and it will appear here.";

        emptyState.appendChild(emptyTitle);
        emptyState.appendChild(emptyText);
        blogList.appendChild(emptyState);
    }

    // Display all blogs
    blogs.forEach(function(blog) {

        const blogItem = document.createElement("div");
        blogItem.className = "blog-item";

        const itemMain = document.createElement("div");
        itemMain.className = "blog-item-main";

        // Blog title
        const title = document.createElement("h3");
        title.textContent = blog.title;

        const meta = document.createElement("div");
        meta.className = "blog-item-meta";

        // Blog category
        const category = document.createElement("p");
        category.textContent = blog.category;

        // Blog status
        const status = document.createElement("span");
        status.className = "status-badge";
        status.textContent = blog.status;
        if (blog.status === "Draft") {
            status.classList.add("draft");
        }

        // Blog date
        const date = document.createElement("p");
        date.textContent = blog.date;

        meta.appendChild(category);
        meta.appendChild(date);
        meta.appendChild(status);

        itemMain.appendChild(title);
        itemMain.appendChild(meta);

        const actions = document.createElement("div");
        actions.className = "blog-item-actions";

        // EDIT BUTTON
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-btn";

        editButton.addEventListener("click", function() {

            // Save the ID of the blog being edited
            localStorage.setItem("editBlogId", blog.id);

            // Open Create Blog page
            window.location.href = "create-blog.html";

        });

        // DELETE BUTTON
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener("click", function() {

            const confirmDelete = confirm(
                "Are you sure you want to delete this blog?"
            );

            if (confirmDelete) {

                const updatedBlogs = blogs.filter(function(item) {
                    return item.id !== blog.id;
                });

                localStorage.setItem(
                    "blogs",
                    JSON.stringify(updatedBlogs)
                );

                alert("Blog deleted successfully!");

                location.reload();

            }

        });

        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        blogItem.appendChild(itemMain);
        blogItem.appendChild(actions);

        // Add blog item to dashboard
        blogList.appendChild(blogItem);

    });

}


// ==========================================
// 3. HOME PAGE - DISPLAY PUBLISHED BLOGS
// ==========================================

const homeBlogList = document.getElementById("homeBlogList");

if (homeBlogList) {

    const blogs = JSON.parse(localStorage.getItem("blogs")) || [];

    homeBlogList.innerHTML = "";

    const published = blogs.filter(blog => blog.status === "Published");

    if (published.length === 0) {
        const emptyState = document.createElement("div");
        emptyState.className = "empty-state";

        const emptyTitle = document.createElement("h3");
        emptyTitle.textContent = "No published stories yet";

        const emptyText = document.createElement("p");
        emptyText.textContent = "When you publish a blog, it will appear in this reading list.";

        emptyState.appendChild(emptyTitle);
        emptyState.appendChild(emptyText);
        homeBlogList.appendChild(emptyState);
    }

    const placeholderImage =
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80";

    // Display only published blogs
    published.forEach(function(blog) {

        const blogCard = document.createElement("article");
        blogCard.className = "blog-card";

        const media = document.createElement("div");
        media.className = "blog-card-media";

        const image = document.createElement("img");
        image.src = blog.image || placeholderImage;
        image.alt = blog.title;
        image.addEventListener("error", function() {
            image.src = placeholderImage;
        });

        media.appendChild(image);

        const body = document.createElement("div");
        body.className = "blog-card-body";

        const meta = document.createElement("div");
        meta.className = "blog-card-meta";

        const category = document.createElement("span");
        category.className = "blog-category";
        category.textContent = blog.category;

        const date = document.createElement("span");
        date.textContent = blog.date || "";

        meta.appendChild(category);
        meta.appendChild(date);

        const title = document.createElement("h3");
        title.textContent = blog.title;

        const content = document.createElement("p");
        content.className = "blog-excerpt";
        const preview = blog.content.length > 120
            ? blog.content.substring(0, 120) + "..."
            : blog.content;
        content.textContent = preview;

        body.appendChild(meta);
        body.appendChild(title);
        body.appendChild(content);

        blogCard.appendChild(media);
        blogCard.appendChild(body);

        homeBlogList.appendChild(blogCard);

    });

}
