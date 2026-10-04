/* =====================================================
   URUK STUDY HOUSE
   MAIN JAVASCRIPT
===================================================== */


/* =====================================================
   MOBILE MENU
===================================================== */

const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");


if (menuToggle && navLinks) {

    menuToggle.addEventListener("click", function () {

        navLinks.classList.toggle("active");

        menuToggle.classList.toggle("active");

    });

}


/* =====================================================
   CLOSE MOBILE MENU WHEN LINK IS CLICKED
===================================================== */

const navigationLinks =
    document.querySelectorAll(".nav-links a");


navigationLinks.forEach(function (link) {

    link.addEventListener("click", function () {

        if (navLinks) {
            navLinks.classList.remove("active");
        }

        if (menuToggle) {
            menuToggle.classList.remove("active");
        }

    });

});


/* =====================================================
   CLOSE MENU WHEN CLICKING OUTSIDE
===================================================== */

document.addEventListener("click", function (event) {

    if (!menuToggle || !navLinks) {
        return;
    }


    const clickedInsideMenu =
        navLinks.contains(event.target);

    const clickedToggle =
        menuToggle.contains(event.target);


    if (
        !clickedInsideMenu &&
        !clickedToggle
    ) {

        navLinks.classList.remove("active");

        menuToggle.classList.remove("active");

    }

});


/* =====================================================
   SMOOTH SCROLL
===================================================== */

document.querySelectorAll('a[href^="#"]').forEach(function (link) {

    link.addEventListener("click", function (event) {

        const targetId =
            this.getAttribute("href");


        if (
            !targetId ||
            targetId === "#"
        ) {
            return;
        }


        const target =
            document.querySelector(targetId);


        if (target) {

            event.preventDefault();


            const navbar =
                document.querySelector(".navbar");


            const navbarHeight =
                navbar
                    ? navbar.offsetHeight
                    : 0;


            const targetPosition =
                target.getBoundingClientRect().top +
                window.pageYOffset -
                navbarHeight;


            window.scrollTo({

                top: targetPosition,

                behavior: "smooth"

            });

        }

    });

});


/* =====================================================
   NAVBAR ON SCROLL
===================================================== */

const navbar =
    document.querySelector(".navbar");


function updateNavbar() {

    if (!navbar) {
        return;
    }


    if (window.scrollY > 50) {

        navbar.style.background =
            "rgba(6, 15, 17, 0.96)";

    } else {

        navbar.style.background =
            "rgba(9, 20, 22, 0.88)";

    }

}


window.addEventListener(
    "scroll",
    updateNavbar,
    { passive: true }
);


updateNavbar();


/* =====================================================
   DISCOVER URUK CAROUSEL
===================================================== */

const discoverTrack =
    document.querySelector(".discover-track");


const discoverSlides =
    document.querySelectorAll(".discover-slide");


const discoverDots =
    document.querySelectorAll(".discover-dot");


if (
    discoverTrack &&
    discoverSlides.length > 0
) {


    /* -------------------------------------------------
       UPDATE ACTIVE DOT
    ------------------------------------------------- */

    function updateDiscoverDots() {

        const trackRect =
            discoverTrack.getBoundingClientRect();


        const trackCenter =
            trackRect.left +
            trackRect.width / 2;


        let closestSlide = 0;

        let smallestDistance =
            Infinity;


        discoverSlides.forEach(function (
            slide,
            index
        ) {

            const rect =
                slide.getBoundingClientRect();


            const slideCenter =
                rect.left +
                rect.width / 2;


            const distance =
                Math.abs(
                    slideCenter -
                    trackCenter
                );


            if (
                distance <
                smallestDistance
            ) {

                smallestDistance =
                    distance;

                closestSlide =
                    index;

            }

        });


        discoverDots.forEach(function (
            dot,
            index
        ) {

            dot.classList.toggle(
                "active",
                index === closestSlide
            );

        });

    }


    /* -------------------------------------------------
       DOT CLICK
    ------------------------------------------------- */

    discoverDots.forEach(function (
        dot,
        index
    ) {

        dot.addEventListener(
            "click",
            function () {

                const slide =
                    discoverSlides[index];


                if (!slide) {
                    return;
                }


                slide.scrollIntoView({

                    behavior: "smooth",

                    block: "nearest",

                    inline: "center"

                });

            }
        );

    });


    /* -------------------------------------------------
       UPDATE DOTS WHILE SCROLLING
    ------------------------------------------------- */

    discoverTrack.addEventListener(
        "scroll",
        function () {

            window.requestAnimationFrame(
                updateDiscoverDots
            );

        },
        { passive: true }
    );


    /* -------------------------------------------------
       INITIAL DOT
    ------------------------------------------------- */

    updateDiscoverDots();


    /* -------------------------------------------------
       MOUSE DRAG
       Allows desktop users to drag carousel
    ------------------------------------------------- */

    let isDragging = false;

    let startX = 0;

    let startScrollLeft = 0;


    discoverTrack.addEventListener(
        "mousedown",
        function (event) {

            isDragging = true;

            discoverTrack.style.cursor =
                "grabbing";


            startX =
                event.pageX -
                discoverTrack.offsetLeft;


            startScrollLeft =
                discoverTrack.scrollLeft;

        }
    );


    discoverTrack.addEventListener(
        "mouseleave",
        function () {

            isDragging = false;

            discoverTrack.style.cursor =
                "grab";

        }
    );


    discoverTrack.addEventListener(
        "mouseup",
        function () {

            isDragging = false;

            discoverTrack.style.cursor =
                "grab";

        }
    );


    discoverTrack.addEventListener(
        "mousemove",
        function (event) {

            if (!isDragging) {
                return;
            }


            event.preventDefault();


            const x =
                event.pageX -
                discoverTrack.offsetLeft;


            const distance =
                (x - startX) * 1.3;


            discoverTrack.scrollLeft =
                startScrollLeft -
                distance;

        }
    );


    /* -------------------------------------------------
       TOUCH SUPPORT
       Mobile swipe is mainly handled by CSS,
       but these values help detect the gesture.
    ------------------------------------------------- */

    let touchStartX = 0;

    let touchStartScroll = 0;


    discoverTrack.addEventListener(
        "touchstart",
        function (event) {

            touchStartX =
                event.touches[0].clientX;

            touchStartScroll =
                discoverTrack.scrollLeft;

        },
        { passive: true }
    );


    discoverTrack.addEventListener(
        "touchend",
        function () {

            updateDiscoverDots();

        },
        { passive: true }
    );

}


/* =====================================================
   PAUSE OTHER VIDEOS
===================================================== */

const allVideos =
    document.querySelectorAll("video");


allVideos.forEach(function (video) {

    video.addEventListener(
        "play",
        function () {

            allVideos.forEach(function (
                otherVideo
            ) {

                if (
                    otherVideo !== video
                ) {

                    otherVideo.pause();

                }

            });

        }
    );

});


/* =====================================================
   VIDEO LOADING
===================================================== */

allVideos.forEach(function (video) {

    video.addEventListener(
        "loadedmetadata",
        function () {

            video.setAttribute(
                "data-loaded",
                "true"
            );

        }
    );

});


/* =====================================================
   SCROLL REVEAL ANIMATION
===================================================== */

const revealElements =
    document.querySelectorAll(
        ".space-card, .room-card, .video-card, .why-item"
    );


if (
    revealElements.length > 0
) {


    const revealObserver =
        new IntersectionObserver(
            function (
                entries,
                observer
            ) {

                entries.forEach(function (
                    entry
                ) {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target.classList.add(
                            "show"
                        );


                        observer.unobserve(
                            entry.target
                        );

                    }

                });

            },
            {

                threshold: 0.12

            }
        );


    revealElements.forEach(function (
        element
    ) {

        revealObserver.observe(
            element
        );

    });

}


/* =====================================================
   STAGGER ANIMATION
   Gives cards a small delay
===================================================== */

const cardGroups = [
    ".space-card",
    ".room-card",
    ".video-card",
    ".why-item",
    ".lecture-card"
];


cardGroups.forEach(function (
    selector
) {

    const cards =
        document.querySelectorAll(
            selector
        );


    cards.forEach(function (
        card,
        index
    ) {

        card.style.transitionDelay =
            `${index * 0.08}s`;

    });

});


/* =====================================================
   LECTURE CARD REVEAL
===================================================== */

const lectureCards =
    document.querySelectorAll(
        ".lecture-card"
    );


if (
    lectureCards.length > 0
) {

    const lectureObserver =
        new IntersectionObserver(
            function (
                entries,
                observer
            ) {

                entries.forEach(function (
                    entry
                ) {

                    if (
                        entry.isIntersecting
                    ) {

                        entry.target.style.opacity =
                            "1";

                        entry.target.style.transform =
                            "translateY(0)";


                        observer.unobserve(
                            entry.target
                        );

                    }

                });

            },
            {

                threshold: 0.15

            }
        );


    lectureCards.forEach(function (
        card
    ) {

        card.style.opacity = "0";

        card.style.transform =
            "translateY(25px)";

        card.style.transition =
            "opacity 0.7s ease, transform 0.7s ease";


        lectureObserver.observe(
            card
        );

    });

}


/* =====================================================
   IMAGE ERROR HANDLING
===================================================== */

const allImages =
    document.querySelectorAll("img");


allImages.forEach(function (image) {

    image.addEventListener(
        "error",
        function () {

            image.classList.add(
                "image-error"
            );

        }
    );

});


/* =====================================================
   PREVENT DRAGGING IMAGES
   Makes carousel interaction smoother
===================================================== */

allImages.forEach(function (image) {

    image.addEventListener(
        "dragstart",
        function (event) {

            event.preventDefault();

        }
    );

});


/* =====================================================
   ACTIVE NAV LINK
===================================================== */

const sections =
    document.querySelectorAll(
        "section[id]"
    );


const navItems =
    document.querySelectorAll(
        ".nav-links a"
    );


function updateActiveNav() {

    let currentSection = "";


    sections.forEach(function (
        section
    ) {

        const sectionTop =
            section.offsetTop - 140;


        const sectionHeight =
            section.offsetHeight;


        if (
            window.scrollY >=
            sectionTop
            &&
            window.scrollY <
            sectionTop +
            sectionHeight
        ) {

            currentSection =
                section.getAttribute("id");

        }

    });


    navItems.forEach(function (
        link
    ) {

        link.classList.remove(
            "active"
        );


        const href =
            link.getAttribute("href");


        if (
            href ===
            "#" + currentSection
        ) {

            link.classList.add(
                "active"
            );

        }

    });

}


window.addEventListener(
    "scroll",
    updateActiveNav,
    { passive: true }
);


updateActiveNav();


/* =====================================================
   PAGE LOAD
===================================================== */

window.addEventListener(
    "load",
    function () {

        document.body.classList.add(
            "page-loaded"
        );


        /* Recalculate carousel dots */

        if (
            typeof updateDiscoverDots ===
            "function"
        ) {

            updateDiscoverDots();

        }

    }
);


/* =====================================================
   CONSOLE MESSAGE
===================================================== */

console.log(
    "URUK Study House website loaded successfully."
);
/* =====================================================
   WHATSAPP
===================================================== */

document.addEventListener("DOMContentLoaded", function () {

    const whatsappButton =
        document.querySelector(".floating-whatsapp");

    if (whatsappButton) {

        whatsappButton.addEventListener("click", function (event) {

            event.preventDefault();

            window.open(
                "https://wa.me/962795379625",
                "_blank"
            );

        });

    }

});