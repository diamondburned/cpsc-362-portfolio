// oneko.js: https://github.com/adryd325/oneko.js

(function oneko() {
  const nekoEl = document.createElement("div");
  let nekoPosX = 64;
  let nekoPosY = 64;
  let mousePosX = 0;
  let mousePosY = 0;
  const isReduced =
    window.matchMedia(`(prefers-reduced-motion: reduce)`) === true ||
    window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;
  if (isReduced) {
    return;
  }

  let frameCount = 0;
  let lastFrameTime = 0;
  let idleTime = 0;
  let idleAnimation = null;
  let idleAnimationFrame = 0;
  const frameTime = 100;
  const nekoSpeed = 30;
  const spriteSets = {
    idle: [[-3, -3]],
    alert: [[-7, -3]],
    scratchSelf: [
      [-5, 0],
      [-6, 0],
      [-7, 0],
    ],
    scratchWallN: [
      [0, 0],
      [0, -1],
    ],
    scratchWallS: [
      [-7, -1],
      [-6, -2],
    ],
    scratchWallE: [
      [-2, -2],
      [-2, -3],
    ],
    scratchWallW: [
      [-4, 0],
      [-4, -1],
    ],
    tired: [[-3, -2]],
    sleeping: [
      [-2, 0],
      [-2, -1],
    ],
    N: [
      [-1, -2],
      [-1, -3],
    ],
    NE: [
      [0, -2],
      [0, -3],
    ],
    E: [
      [-3, 0],
      [-3, -1],
    ],
    SE: [
      [-5, -1],
      [-5, -2],
    ],
    S: [
      [-6, -3],
      [-7, -2],
    ],
    SW: [
      [-5, -3],
      [-6, -1],
    ],
    W: [
      [-4, -2],
      [-4, -3],
    ],
    NW: [
      [-1, 0],
      [-1, -1],
    ],
  };

  function create() {
    nekoEl.id = "oneko";
    nekoEl.style.width = "64px";
    nekoEl.style.height = "64px";
    nekoEl.style.position = "absolute";
    nekoEl.style.pointerEvents = "none";
    nekoEl.style.backgroundImage = "url('./oneko.gif')";
    nekoEl.style.imageRendering = "pixelated";
    nekoEl.style.left = `${nekoPosX - 32}px`;
    nekoEl.style.top = `${nekoPosY - 32}px`;
    nekoEl.style.zIndex = "0";

    document.body.appendChild(nekoEl);

    document.addEventListener("mousemove", (event) => {
      mousePosX = event.clientX;
      mousePosY = event.clientY;
    });

    frame(0);
  }

  function setSprite(name, frame) {
    const sprite = spriteSets[name][frame % spriteSets[name].length];
    nekoEl.style.backgroundPosition = `${sprite[0] * 64}px ${sprite[1] * 64}px`;
  }

  function resetIdleAnimation() {
    idleAnimation = null;
    idleAnimationFrame = 0;
  }

  function idle() {
    idleTime += 1;

    // every ~ 20 seconds
    if (
      idleTime > 10 &&
      Math.floor(Math.random() * 200) == 0 &&
      idleAnimation == null
    ) {
      let avalibleIdleAnimations = ["sleeping", "scratchSelf"];
      if (nekoPosX < 64) {
        avalibleIdleAnimations.push("scratchWallW");
      }
      if (nekoPosY < 64) {
        avalibleIdleAnimations.push("scratchWallN");
      }
      if (nekoPosX > document.scrollingElement.scrollWidth - 64) {
        avalibleIdleAnimations.push("scratchWallE");
      }
      if (nekoPosY > document.scrollingElement.scrollHeight - 64) {
        avalibleIdleAnimations.push("scratchWallS");
      }
      idleAnimation =
        avalibleIdleAnimations[
          Math.floor(Math.random() * avalibleIdleAnimations.length)
        ];
    }

    switch (idleAnimation) {
      case "sleeping":
        if (idleAnimationFrame < 8) {
          setSprite("tired", 0);
          break;
        }
        setSprite("sleeping", Math.floor(idleAnimationFrame / 4));
        if (idleAnimationFrame > 192) {
          resetIdleAnimation();
        }
        break;
      case "scratchWallN":
      case "scratchWallS":
      case "scratchWallE":
      case "scratchWallW":
      case "scratchSelf":
        setSprite(idleAnimation, idleAnimationFrame);
        if (idleAnimationFrame > 9) {
          resetIdleAnimation();
        }
        break;
      default:
        setSprite("idle", 0);
        return;
    }
    idleAnimationFrame += 1;
  }

  function frame(ts) {
    window.onekoFrameCallback = window.requestAnimationFrame(frame);
    if (ts - lastFrameTime >= frameTime) {
      lastFrameTime = ts;
    } else {
      return;
    }

    frameCount += 1;
    const diffX = nekoPosX - (mousePosX + document.scrollingElement.scrollLeft);
    const diffY = nekoPosY - (mousePosY + document.scrollingElement.scrollTop);
    const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

    if (distance < nekoSpeed || distance < 48) {
      idle();
      return;
    }

    idleAnimation = null;
    idleAnimationFrame = 0;

    if (idleTime > 1) {
      setSprite("alert", 0);
      // count down after being alerted before moving
      idleTime = Math.min(idleTime, 7);
      idleTime -= 1;
      return;
    }

    let direction;
    direction = diffY / distance > 0.5 ? "N" : "";
    direction += diffY / distance < -0.5 ? "S" : "";
    direction += diffX / distance > 0.5 ? "W" : "";
    direction += diffX / distance < -0.5 ? "E" : "";
    setSprite(direction, frameCount);

    nekoPosX -= (diffX / distance) * nekoSpeed;
    nekoPosY -= (diffY / distance) * nekoSpeed;

    nekoPosX = Math.min(Math.max(32, nekoPosX), document.body.scrollWidth - 32);
    nekoPosY = Math.min(
      Math.max(32, nekoPosY),
      document.body.scrollHeight - 32,
    );

    nekoEl.style.left = `${nekoPosX - 32}px`;
    nekoEl.style.top = `${nekoPosY - 32}px`;
  }

  create();
})();
