import React, { useRef, useEffect, useState } from "react";

function randomBetween(a: number, b: number) {
    return a + Math.random() * (b - a);
}

interface Star {
    angle: number;
    radius: number;
    maxZ: number;
    size: number;
    color: string;
    isAstral: boolean;
}

export const AnimatedGridBackground: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const starsRef = useRef<Star[]>([]);
    const [scrollRatio, setScrollRatio] = useState(0);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0, scrollHeight: 0 });

    // Generate stars based on area
    useEffect(() => {
        const STAR_COLORS = ["#fff", "#e0e7ff", "#fef08a", "#bae6fd"];
        const ASTRAL_COLOR = "#14532d"; // dark green
        const width = window.innerWidth;
        const scrollHeight = document.documentElement.scrollHeight;
        let FOV = width / 1.2;
        // 1 star per 20,000 px^2, min 40, max 200
        const area = width * scrollHeight;
        const STAR_COUNT = Math.max(40, Math.min(200, Math.floor(area / 20000)));
        const ASTRAL_COUNT = Math.max(3, Math.floor(STAR_COUNT * 0.08));
        const stars: Star[] = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            const angle = randomBetween(-Math.PI, Math.PI);
            const radius = randomBetween(0, width * 0.08 + scrollHeight * 0.08);
            const maxZ = randomBetween(FOV * 0.7, FOV);
            const size = randomBetween(1, 2.5);
            const color = STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)];
            stars.push({ angle, radius, maxZ, size, color, isAstral: false });
        }
        for (let i = 0; i < ASTRAL_COUNT; i++) {
            const angle = randomBetween(-Math.PI, Math.PI);
            const radius = randomBetween(0, width * 0.08 + scrollHeight * 0.08);
            const maxZ = randomBetween(FOV * 0.7, FOV);
            const size = randomBetween(1, 1.5); // max 3px diameter
            const color = ASTRAL_COLOR;
            stars.push({ angle, radius, maxZ, size, color, isAstral: true });
        }
        starsRef.current = stars;
    }, [dimensions.width, dimensions.scrollHeight]);

    // Track scroll and window size
    useEffect(() => {
        const handleScroll = () => {
            const scrollY = window.scrollY || window.pageYOffset;
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = window.innerHeight;
            const maxScroll = Math.max(1, scrollHeight - clientHeight);
            setScrollRatio(Math.min(1, Math.max(0, scrollY / maxScroll)));
        };
        const handleResize = () => {
            setDimensions({
                width: window.innerWidth,
                height: window.innerHeight,
                scrollHeight: document.documentElement.scrollHeight,
            });
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        window.addEventListener("resize", handleResize);
        handleScroll();
        handleResize();
        return () => {
            window.removeEventListener("scroll", handleScroll);
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    // Draw on scroll/resize
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        const width = window.innerWidth;
        const scrollHeight = document.documentElement.scrollHeight;
        let FOV = width / 1.2;
        canvas.width = width;
        canvas.height = scrollHeight;

        // Focus point moves from right to left as user scrolls
        const centerX = width * (1 - scrollRatio);
        const centerY = scrollHeight * 0.5;

        ctx.clearRect(0, 0, width, scrollHeight);
        // Fill background with dark black/green
        const bgGradient = ctx.createLinearGradient(0, 0, width, scrollHeight);
        bgGradient.addColorStop(0, "#07110d"); // very dark green-black
        bgGradient.addColorStop(1, "#000");
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, width, scrollHeight);
        ctx.restore();

        for (let star of starsRef.current) {
            // z is proportional to (1 - scrollRatio): at top, z=maxZ (at focus), at bottom, z=0 (far away)
            const z = star.maxZ * (1 - scrollRatio) + 1; // avoid div by zero
            const px = centerX + (Math.cos(star.angle) * star.radius * FOV) / z;
            const py = centerY + (Math.sin(star.angle) * star.radius * FOV) / z;
            // If offscreen, skip drawing
            if (
                px < -100 || px > width + 100 ||
                py < -100 || py > scrollHeight + 100
            ) {
                continue;
            }
            ctx.save();
            if (star.isAstral) {
                ctx.globalAlpha = 0.7;
                ctx.beginPath();
                ctx.arc(px, py, star.size, 0, 2 * Math.PI);
                ctx.fillStyle = star.color;
                ctx.shadowBlur = 0;
                ctx.fill();
            } else {
                ctx.globalAlpha = 0.7;
                ctx.beginPath();
                ctx.arc(px, py, star.size, 0, 2 * Math.PI);
                ctx.fillStyle = star.color;
                ctx.shadowColor = star.color;
                ctx.shadowBlur = 8;
                ctx.fill();
            }
            ctx.restore();
        }
    }, [scrollRatio, dimensions]);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: "fixed",
                left: 0,
                top: 0,
                width: "100vw",
                height: "100%",
                pointerEvents: "none",
                zIndex: 0,
            }}
            aria-hidden="true"
        />
    );
}; 