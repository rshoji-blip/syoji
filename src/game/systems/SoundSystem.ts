// 手続き型サウンドシステム - 外部ファイル不要、Web Audio API で合成

class SoundSystem {
  private ctx: AudioContext | null = null
  private masterGain: GainNode | null = null
  private muted: boolean = false

  // 遅延初期化: ブラウザはユーザー操作後にAudioContextを許可する
  private getCtx(): AudioContext | null {
    try {
      if (!this.ctx) {
        this.ctx = new AudioContext()
        this.masterGain = this.ctx.createGain()
        this.masterGain.gain.value = 0.4
        this.masterGain.connect(this.ctx.destination)
      }
      // 自動停止された場合は再開
      if (this.ctx.state === 'suspended') this.ctx.resume()
      return this.ctx
    } catch {
      return null
    }
  }

  private getMaster(): GainNode | null {
    this.getCtx()
    return this.masterGain
  }

  setMuted(muted: boolean): void {
    this.muted = muted
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : 0.4
    }
  }

  isMuted(): boolean { return this.muted }

  // プレイヤー射撃音: 高音から降下するビーム音
  shoot(): void {
    const ctx = this.getCtx()
    const master = this.getMaster()
    if (!ctx || !master) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(master)

    osc.type = 'square'
    osc.frequency.setValueAtTime(1200, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.06)

    gain.gain.setValueAtTime(0.12, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.07)
  }

  // 弾ヒット音: 短いノイズバースト
  hit(): void {
    const ctx = this.getCtx()
    const master = this.getMaster()
    if (!ctx || !master) return

    const bufferSize = ctx.sampleRate * 0.05
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize)
    }

    const source = ctx.createBufferSource()
    source.buffer = buffer

    const filter = ctx.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 2000
    filter.Q.value = 0.8

    const gain = ctx.createGain()
    gain.gain.value = 0.2

    source.connect(filter)
    filter.connect(gain)
    gain.connect(master)
    source.start(ctx.currentTime)
  }

  // 敵撃破音: 下降するトーン + ノイズ
  enemyDie(): void {
    const ctx = this.getCtx()
    const master = this.getMaster()
    if (!ctx || !master) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(master)

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(400, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.3)

    gain.gain.setValueAtTime(0.2, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.3)
  }

  // ボス撃破: 派手な多重音
  bossDie(): void {
    const ctx = this.getCtx()
    const master = this.getMaster()
    if (!ctx || !master) return

    const freqs = [200, 160, 120, 80]
    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(master)

      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(freq * 2, ctx.currentTime + i * 0.1)
      osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + i * 0.1 + 0.4)

      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.1)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.4)

      osc.start(ctx.currentTime + i * 0.1)
      osc.stop(ctx.currentTime + i * 0.1 + 0.4)
    })
  }

  // プレイヤーダメージ音: 低い鈍打音
  playerDamage(): void {
    const ctx = this.getCtx()
    const master = this.getMaster()
    if (!ctx || !master) return

    const osc = ctx.createOscillator()
    const dist = ctx.createWaveShaper()
    const gain = ctx.createGain()

    // 歪みカーブ
    const curve = new Float32Array(256)
    for (let i = 0; i < 256; i++) {
      curve[i] = Math.tanh((i / 128 - 1) * 10)
    }
    dist.curve = curve

    osc.connect(dist)
    dist.connect(gain)
    gain.connect(master)

    osc.type = 'sine'
    osc.frequency.setValueAtTime(120, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2)

    gain.gain.setValueAtTime(0.4, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.25)
  }

  // ウェーブクリア: 上昇するアルペジオ
  waveClear(): void {
    const ctx = this.getCtx()
    const master = this.getMaster()
    if (!ctx || !master) return

    const notes = [523, 659, 784, 1047] // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(master)

      osc.type = 'triangle'
      osc.frequency.value = freq

      const t = ctx.currentTime + i * 0.12
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.25, t + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3)

      osc.start(t)
      osc.stop(t + 0.3)
    })
  }

  // UIボタンクリック音
  buttonClick(): void {
    const ctx = this.getCtx()
    const master = this.getMaster()
    if (!ctx || !master) return

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(master)

    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, ctx.currentTime)
    osc.frequency.linearRampToValueAtTime(1000, ctx.currentTime + 0.03)

    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.06)
  }

  // スキル取得音: 魔法的な上昇音
  skillAcquire(): void {
    const ctx = this.getCtx()
    const master = this.getMaster()
    if (!ctx || !master) return

    const notes = [523, 784, 1047, 1568]
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(master)

      osc.type = 'sine'
      osc.frequency.value = freq

      const t = ctx.currentTime + i * 0.08
      gain.gain.setValueAtTime(0.2, t)
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2)

      osc.start(t)
      osc.stop(t + 0.2)
    })
  }
}

// モジュールレベルシングルトン (どこからでもインポート可能)
export const soundSystem = new SoundSystem()
