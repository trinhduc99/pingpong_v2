export default class Player {
  constructor(x, y, width, height, score, life) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = "green";
    this.speed = 7;
    this.isLeft = false;
    this.isRight = false;
    this.life = life;
    this.score = score;
    this.isWon = false;
  }
  draw(ctx) {
    ctx.beginPath();
    let gradient = ctx.createLinearGradient(
      this.x,
      this.y,
      this.x + this.width,
      this.y + this.height
    );
    gradient.addColorStop(0, "cyan");
    gradient.addColorStop(0.5, "blue");
    gradient.addColorStop(1, "cyan");
    ctx.fillStyle = gradient;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    ctx.closePath();
  }
  update(canvas) {
    if (this.isLeft) {
      this.x -= this.speed;
    } else if (this.isRight) {
      this.x += this.speed;
    }

    if (this.x < 0) {
      this.x = 0;
    } else if (this.x + this.width > canvas.width) {
      this.x = canvas.width - this.width;
    }
  }
}
