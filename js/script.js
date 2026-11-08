// ==========================================
// LOGOUT
// ==========================================

const logoutLink = document.querySelector(".sidebar nav a[href='login.html']");

if (logoutLink) {
    logoutLink.addEventListener("click", function (event) {
        event.preventDefault();
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "login.html";
    });
}

// ==========================================
// 0. USER REGISTRATION
// ==========================================

const registerForm = document.getElementById("registerForm");

if (registerForm) {
    registerForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;
        const confirmPassword = document.getElementById("confirmPassword").value;

        if (password !== confirmPassword) {
            alert("Passwords do not match!");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name,
                    email,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert("Registration successful! Please login.");
                window.location.href = "login.html";
            } else {
                alert(data.message || "Registration failed.");
            }

        } catch (error) {
            console.error("Registration error:", error);
            alert("Unable to connect to the server. Please try again.");
        }
    });
}

// ==========================================
// 1. USER LOGIN
// ==========================================

const loginForm = document.getElementById("loginForm");

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("http://localhost:5000/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem("token", data.token);
                localStorage.setItem("user", JSON.stringify(data.user));

                alert("Login successful!");
                window.location.href = "dashboard.html";

            } else {
                alert(data.message || "Login failed.");
            }

        } catch (error) {
            console.error("Login error:", error);
            alert("Unable to connect to the server. Please try again.");
        }
    });
}


// ==========================================
// 2. CREATE AND EDIT BLOG
// ==========================================

const blogForm = document.getElementById("blogForm");

if (blogForm) {

    const titleInput = document.getElementById("blogTitle");
    const categoryInput = document.getElementById("category");
    const imageInput = document.getElementById("coverImage");
    const contentInput = document.getElementById("blogContent");

    const submitButton = blogForm.querySelector('button[type="submit"]');
    const editorHeading = document.getElementById("editorHeading");
    const editorSubtitle = document.getElementById("editorSubtitle");

    const editBlogId = localStorage.getItem("editBlogId");

    // Load existing blog details when editing
    if (editBlogId) {

        const blogToEdit = JSON.parse(
            localStorage.getItem("editBlogData")
        );

        if (blogToEdit) {

            titleInput.value = blogToEdit.title;
            categoryInput.value = blogToEdit.category;
            imageInput.value = blogToEdit.image || "";
            contentInput.value = blogToEdit.content;

            if (submitButton) {
                submitButton.textContent = "Update Blog";
            }

            blogForm.classList.add("is-editing");

            if (editorHeading) {
                editorHeading.textContent = "Update your story";
            }

            if (editorSubtitle) {
                editorSubtitle.textContent =
                    "Revise the post, then save the latest version to your library.";
            }

        } else {

            localStorage.removeItem("editBlogId");
            localStorage.removeItem("editBlogData");

        }
    }

    // Handle form submission
    blogForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const title = titleInput.value.trim();
        const category = categoryInput.value;
        const image = imageInput.value.trim();
        const content = contentInput.value.trim();

        if (!title || !category || !content) {
            alert("Please fill in all required fields.");
            return;
        }

        const currentEditId = localStorage.getItem("editBlogId");
        const token = localStorage.getItem("token");

        if (!token) {
            alert("Please login before saving a blog.");
            window.location.href = "login.html";
            return;
        }

        try {

            const response = await fetch(
                currentEditId
                    ? `http://localhost:5000/api/blogs/${currentEditId}`
                    : "http://localhost:5000/api/blogs",
                {
                    method: currentEditId ? "PUT" : "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        title,
                        category,
                        image,
                        content,
                        status: "Published"
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                if (currentEditId) {

                    localStorage.removeItem("editBlogId");
                    localStorage.removeItem("editBlogData");

                    alert("Your blog has been updated successfully!");

                } else {

                    alert("Your blog has been published successfully!");

                }

                window.location.href = "dashboard.html";

            } else {

                alert(data.message || "Failed to save blog.");

            }

        } catch (error) {

            console.error("Save blog error:", error);
            alert("Unable to connect to the server. Please try again.");

        }

    });
}


// ==========================================
// DASHBOARD - DISPLAY, EDIT AND DELETE BLOGS
// ==========================================

const blogList = document.getElementById("blogList");

if (blogList) {
    const totalBlogs = document.getElementById("totalBlogs");
    const publishedBlogs = document.getElementById("publishedBlogs");
    const draftBlogs = document.getElementById("draftBlogs");
    const dashboardUserName = document.getElementById("dashboardUserName");
    const dashboardUserEmail = document.getElementById("dashboardUserEmail");

    let dashboardUser = null;

    try {
        const storedUser = localStorage.getItem("user");
        dashboardUser = storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
        dashboardUser = null;
    }

    const displayName = typeof dashboardUser?.name === "string"
        ? dashboardUser.name.trim()
        : "";
    const displayEmail = typeof dashboardUser?.email === "string"
        ? dashboardUser.email.trim()
        : "";

    dashboardUserName.textContent = displayName || "there";
    dashboardUserEmail.textContent = displayEmail || "Profile information unavailable";

    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please login to view your dashboard.");
        window.location.href = "login.html";
    } else {

        const loadDashboardBlogs = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/blogs", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                const data = await response.json();

                if (!response.ok) {
                    alert(data.message || "Unable to load blogs.");

                    if (response.status === 401) {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        window.location.href = "login.html";
                    }
                    return;
                }

                const blogs = data.blogs;

                totalBlogs.textContent = blogs.length;
                publishedBlogs.textContent =
                    blogs.filter(blog => blog.status === "Published").length;
                draftBlogs.textContent =
                    blogs.filter(blog => blog.status === "Draft").length;

                blogList.innerHTML = "";

                if (blogs.length === 0) {
                    const emptyState = document.createElement("div");
                    emptyState.className = "empty-state";
                    emptyState.innerHTML = `
                        <h3>No blog posts yet</h3>
                        <p>Create your first story and it will appear here.</p>
                    `;
                    blogList.appendChild(emptyState);
                    return;
                }

                blogs.forEach(function (blog) {
                    const blogItem = document.createElement("div");
                    blogItem.className = "blog-item";

                    const itemMain = document.createElement("div");
                    itemMain.className = "blog-item-main";

                    const title = document.createElement("h3");
                    title.textContent = blog.title;

                    const meta = document.createElement("div");
                    meta.className = "blog-item-meta";

                    const category = document.createElement("p");
                    category.textContent = blog.category;

                    const status = document.createElement("span");
                    status.className = "status-badge";
                    status.textContent = blog.status;

                    if (blog.status === "Draft") {
                        status.classList.add("draft");
                    }

                    const date = document.createElement("p");
                    date.textContent =
                        new Date(blog.createdAt).toLocaleDateString();

                    meta.appendChild(category);
                    meta.appendChild(date);
                    meta.appendChild(status);

                    itemMain.appendChild(title);
                    itemMain.appendChild(meta);

                    // Edit button
                    const actions = document.createElement("div");
                    actions.className = "blog-actions";

                    const editButton = document.createElement("button");
                    editButton.className = "edit-btn";
                    editButton.textContent = "Edit";

                    editButton.addEventListener("click", function () {
                        localStorage.setItem("editBlogId", blog._id);
                        localStorage.setItem("editBlogData", JSON.stringify(blog));
                    
                        window.location.href = "create-blog.html";
                    });

                    // Delete button
                    const deleteButton = document.createElement("button");
                    deleteButton.className = "delete-btn";
                    deleteButton.textContent = "Delete";

                    deleteButton.addEventListener("click", async function () {
                        const confirmDelete = confirm(
                            "Are you sure you want to delete this blog?"
                        );

                        if (!confirmDelete) return;

                        try {
                            const deleteResponse = await fetch(
                                `http://localhost:5000/api/blogs/${blog._id}`,
                                {
                                    method: "DELETE",
                                    headers: {
                                        "Authorization": `Bearer ${token}`
                                    }
                                }
                            );

                            const deleteData = await deleteResponse.json();

                            if (deleteResponse.ok) {
                                alert("Blog deleted successfully!");
                                loadDashboardBlogs();
                            } else {
                                alert(deleteData.message || "Failed to delete blog.");
                            }

                        } catch (error) {
                            console.error("Delete error:", error);
                            alert("Unable to connect to the server.");
                        }
                    });

                    actions.appendChild(editButton);
                    actions.appendChild(deleteButton);

                    blogItem.appendChild(itemMain);
                    blogItem.appendChild(actions);

                    blogList.appendChild(blogItem);
                });

            } catch (error) {
                console.error("Dashboard error:", error);
                alert("Unable to connect to the server. Please try again.");
            }
        };

        loadDashboardBlogs();
    }
}


/* ==========================================
   3. HOME PAGE - DISPLAY PUBLISHED BLOGS
========================================== */

const homeBlogList = document.getElementById("homeBlogList");

if (homeBlogList) {
    const blogSearch = document.getElementById("blogSearch");
    const categoryFilter = document.getElementById("categoryFilter");

    let allPublishedBlogs = [];
    const placeholderImage =
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1200&q=80";

    const loadPublishedBlogs = async () => {

        try {
            const response = await fetch(
                "http://localhost:5000/api/blogs/published"
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Failed to load blogs.");
            }

            homeBlogList.innerHTML = "";

            allPublishedBlogs = data.blogs;

            const published = allPublishedBlogs;

            // Populate category dropdown
            const categories = [
                ...new Set(published.map(blog => blog.category))
            ];

            categories.forEach(function (category) {
                const option = document.createElement("option");
                option.value = category;
                option.textContent = category;
                categoryFilter.appendChild(option);
            });

            if (published.length === 0) {

                const emptyState = document.createElement("div");
                emptyState.className = "empty-state";

                const emptyTitle = document.createElement("h3");
                emptyTitle.textContent = "No published stories yet";

                const emptyText = document.createElement("p");
                emptyText.textContent =
                    "When you publish a blog, it will appear in this reading list.";

                emptyState.appendChild(emptyTitle);
                emptyState.appendChild(emptyText);

                homeBlogList.appendChild(emptyState);
                return;
            }

            published.forEach(function (blog) {

                const blogCard = document.createElement("article");
                blogCard.className = "blog-card";
                blogCard.style.cursor = "pointer";

                blogCard.addEventListener("click", function () {
                     window.location.href = `blog-details.html?id=${encodeURIComponent(blog._id)}`;
                    }
                );

                const media = document.createElement("div");
                media.className = "blog-card-media";

                const image = document.createElement("img");
                image.src = blog.image || placeholderImage;
                image.alt = blog.title;

                image.addEventListener("error", function () {
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
                date.textContent = new Date(blog.createdAt)
                    .toLocaleDateString();

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

            // Search and category filtering
            const applyBlogFilters = () => {

                const searchTerm = blogSearch.value.trim().toLowerCase();
                const selectedCategory = categoryFilter.value;

                let visibleCount = 0;

                const cards = homeBlogList.querySelectorAll(".blog-card");

                cards.forEach(function (card, index) {

                    const blog = published[index];

                    const matchesSearch = blog.title
                     .toLowerCase()
                    .includes(searchTerm);

                    const matchesCategory =
                        selectedCategory === "all" ||
                        blog.category === selectedCategory;

                    const shouldShow = matchesSearch && matchesCategory;

                    card.style.display = shouldShow ? "" : "none";

                    if (shouldShow) {
                        visibleCount++;
                    }
                });

                let message = document.getElementById("noBlogResults");

                if (visibleCount === 0) {

                    if (!message) {
                        message = document.createElement("p");
                        message.id = "noBlogResults";
                        message.textContent = "No matching blogs found.";
                        homeBlogList.appendChild(message);
                    }

                } else if (message) {
                    message.remove();
                }
            };

            blogSearch.addEventListener("input", applyBlogFilters);

            categoryFilter.addEventListener("change", applyBlogFilters);

        } catch (error) {
            console.error("Home page blogs error:", error);

            homeBlogList.innerHTML =
                "<p>Unable to load blogs. Please try again later.</p>";
        }
    };

    loadPublishedBlogs();
}


/* ==========================================
   BLOG DETAILS PAGE
========================================== */

const blogDetails = document.getElementById("blogDetails");

if (blogDetails) {

    const params = new URLSearchParams(window.location.search);
    const blogId = params.get("id");

    const loadBlogDetails = async () => {

        if (!blogId) {
            blogDetails.innerHTML = "<p>Blog ID not found.</p>";
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:5000/api/blogs/published/${encodeURIComponent(blogId)}`
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to load blog.");
            }

            const blog = data.blog;

            const authorName = blog.author?.name || "Unknown Author";

            const formattedDate = new Date(blog.createdAt)
                .toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                });

            const imageHTML = blog.image
                ? `<img src="${escapeHTML(blog.image)}" alt="${escapeHTML(blog.title)}">`
                : "";

            blogDetails.innerHTML = `
                <a href="index.html" class="back-link">
                    &larr; Back to Home
                </a>

                <article class="blog-detail-card">

                    ${imageHTML}

                    <div class="blog-detail-content">

                        <span class="blog-category">
                            ${escapeHTML(blog.category)}
                        </span>

                        <h1>${escapeHTML(blog.title)}</h1>

                        <p class="blog-meta">
                            By ${escapeHTML(authorName)} 
                            &bull; ${formattedDate}
                        </p>

                        <div class="blog-full-content">
                            ${escapeHTML(blog.content).replace(/\n/g, "<br>")}
                        </div>

                    </div>
                </article>
            `;

        } catch (error) {
            console.error("Blog details error:", error);

            blogDetails.innerHTML = `
                <p>Unable to load this blog. Please try again later.</p>
                <a href="index.html">Back to Home</a>
            `;
        }
    };

    loadBlogDetails();
}

// Safely display text from the database
function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, function (char) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        }[char];
    });
}
