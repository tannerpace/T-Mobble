"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface Obstacle {
  x: number
  width: number
  height: number
  type: "cactus" | "bird"
}

const DinoGame = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [gameOver, setGameOver] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)

  // Game state refs
  const gameStateRef = useRef({
    dinoY: 0,
    dinoVelocity: 0,
    isJumping: false,
    obstacles: [] as Obstacle[],
    frameCount: 0,
    gameSpeed: 5,
  })

  const CANVAS_WIDTH = 1200
  const CANVAS_HEIGHT = 300
  const DINO_WIDTH = 40
  const DINO_HEIGHT = 50
  const GROUND_HEIGHT = 20
  const GRAVITY = 0.6
  const JUMP_STRENGTH = -10

  // Load high score from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("dinoHighScore")
    if (saved) setHighScore(parseInt(saved))
  }, [])

  const jump = useCallback(() => {
    if (!gameStateRef.current.isJumping && gameStarted && !gameOver) {
      gameStateRef.current.dinoVelocity = JUMP_STRENGTH
      gameStateRef.current.isJumping = true
    }
  }, [gameStarted, gameOver])

  const startGame = useCallback(() => {
    setGameStarted(true)
    setGameOver(false)
    setScore(0)
    gameStateRef.current = {
      dinoY: 0,
      dinoVelocity: 0,
      isJumping: false,
      obstacles: [],
      frameCount: 0,
      gameSpeed: 5,
    }
  }, [])

  const handleKeyPress = useCallback(
    (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault()
        if (!gameStarted || gameOver) {
          startGame()
        } else {
          jump()
        }
      }
    },
    [gameStarted, gameOver, startGame, jump]
  )

  const handleTouch = useCallback(() => {
    if (!gameStarted || gameOver) {
      startGame()
    } else {
      jump()
    }
  }, [gameStarted, gameOver, startGame, jump])

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress)
    window.addEventListener("touchstart", handleTouch)
    return () => {
      window.removeEventListener("keydown", handleKeyPress)
      window.removeEventListener("touchstart", handleTouch)
    }
  }, [handleKeyPress, handleTouch])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number

    const drawDino = (y: number, isRunning: boolean) => {
      ctx.fillStyle = "#535353"

      // Body
      ctx.fillRect(
        50,
        CANVAS_HEIGHT - GROUND_HEIGHT - DINO_HEIGHT - y,
        DINO_WIDTH,
        DINO_HEIGHT
      )

      // Eye
      ctx.fillStyle = "white"
      ctx.fillRect(
        70,
        CANVAS_HEIGHT - GROUND_HEIGHT - DINO_HEIGHT - y + 10,
        6,
        6
      )

      // Legs (animated when running)
      ctx.fillStyle = "#535353"
      if (isRunning && Math.floor(Date.now() / 100) % 2 === 0) {
        ctx.fillRect(55, CANVAS_HEIGHT - GROUND_HEIGHT - y, 8, 15)
        ctx.fillRect(75, CANVAS_HEIGHT - GROUND_HEIGHT - y, 8, 15)
      } else {
        ctx.fillRect(60, CANVAS_HEIGHT - GROUND_HEIGHT - y, 8, 15)
        ctx.fillRect(70, CANVAS_HEIGHT - GROUND_HEIGHT - y, 8, 15)
      }
    }

    const drawObstacle = (obstacle: Obstacle) => {
      ctx.fillStyle = "#535353"
      if (obstacle.type === "cactus") {
        // Draw cactus
        ctx.fillRect(
          obstacle.x,
          CANVAS_HEIGHT - GROUND_HEIGHT - obstacle.height,
          obstacle.width,
          obstacle.height
        )
        // Cactus arms
        ctx.fillRect(
          obstacle.x - 5,
          CANVAS_HEIGHT - GROUND_HEIGHT - obstacle.height + 10,
          5,
          15
        )
        ctx.fillRect(
          obstacle.x + obstacle.width,
          CANVAS_HEIGHT - GROUND_HEIGHT - obstacle.height + 15,
          5,
          10
        )
      } else {
        // Draw bird
        const birdY = CANVAS_HEIGHT - GROUND_HEIGHT - 80
        ctx.fillRect(obstacle.x, birdY, obstacle.width, obstacle.height)
        // Wings
        const wingFlap = Math.floor(Date.now() / 100) % 2 === 0
        ctx.fillRect(obstacle.x - 10, birdY + (wingFlap ? -5 : 5), 10, 5)
        ctx.fillRect(
          obstacle.x + obstacle.width,
          birdY + (wingFlap ? -5 : 5),
          10,
          5
        )
      }
    }

    const checkCollision = (obstacle: Obstacle): boolean => {
      const dinoX = 50
      const dinoY =
        CANVAS_HEIGHT - GROUND_HEIGHT - DINO_HEIGHT - gameStateRef.current.dinoY
      const dinoBottom = dinoY + DINO_HEIGHT

      const obstacleY =
        obstacle.type === "cactus"
          ? CANVAS_HEIGHT - GROUND_HEIGHT - obstacle.height
          : CANVAS_HEIGHT - GROUND_HEIGHT - 80
      const obstacleBottom = obstacleY + obstacle.height

      return (
        dinoX < obstacle.x + obstacle.width - 5 &&
        dinoX + DINO_WIDTH - 5 > obstacle.x &&
        dinoY < obstacleBottom &&
        dinoBottom > obstacleY + 5
      )
    }

    const gameLoop = () => {
      if (!gameStarted || gameOver) {
        animationFrameId = requestAnimationFrame(gameLoop)
        return
      }

      const state = gameStateRef.current

      // Clear canvas
      ctx.fillStyle = "white"
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Draw ground
      ctx.strokeStyle = "#535353"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, CANVAS_HEIGHT - GROUND_HEIGHT)
      ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_HEIGHT)
      ctx.stroke()

      // Update dino physics
      state.dinoVelocity += GRAVITY
      state.dinoY += state.dinoVelocity

      if (state.dinoY <= 0) {
        state.dinoY = 0
        state.dinoVelocity = 0
        state.isJumping = false
      }

      // Draw dino
      drawDino(state.dinoY, !state.isJumping)

      // Generate obstacles
      state.frameCount++
      if (state.frameCount % 120 === 0) {
        const obstacleType = Math.random() > 0.7 ? "bird" : "cactus"
        state.obstacles.push({
          x: CANVAS_WIDTH,
          width: obstacleType === "bird" ? 40 : 20,
          height: obstacleType === "bird" ? 20 : 40 + Math.random() * 20,
          type: obstacleType,
        })
      }

      // Update and draw obstacles
      state.obstacles = state.obstacles.filter((obstacle) => {
        obstacle.x -= state.gameSpeed

        if (checkCollision(obstacle)) {
          setGameOver(true)
          if (score > highScore) {
            setHighScore(score)
            localStorage.setItem("dinoHighScore", score.toString())
          }
          return true
        }

        if (obstacle.x > -obstacle.width) {
          drawObstacle(obstacle)
          return true
        }
        return false
      })

      // Update score
      setScore((prev) => prev + 1)

      // Increase speed gradually
      if (state.frameCount % 300 === 0) {
        state.gameSpeed += 0.5
      }

      animationFrameId = requestAnimationFrame(gameLoop)
    }

    animationFrameId = requestAnimationFrame(gameLoop)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [gameStarted, gameOver, score, highScore])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white p-4">
      <div className="mb-4 flex gap-8 text-lg font-mono">
        <div>Score: {Math.floor(score / 10)}</div>
        <div>High Score: {highScore}</div>
      </div>

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="border-2 border-gray-300 rounded-lg shadow-lg bg-white"
        />

        {!gameStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
            <div className="text-center">
              <h1 className="text-3xl font-bold mb-4">Dino Game</h1>
              <p className="text-gray-600 mb-2">Press SPACE or TAP to start</p>
              <p className="text-sm text-gray-500">Jump over obstacles!</p>
            </div>
          </div>
        )}

        {gameOver && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 rounded-lg">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Game Over!</h2>
              <p className="text-xl mb-2">Score: {Math.floor(score / 10)}</p>
              <p className="text-gray-600 mb-4">
                Press SPACE or TAP to restart
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-center text-sm text-gray-500">
        <p>Desktop: Press SPACE to jump</p>
        <p>Mobile: Tap anywhere to jump</p>
      </div>
    </div>
  )
}

export default DinoGame
