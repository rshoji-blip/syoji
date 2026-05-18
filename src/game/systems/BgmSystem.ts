// 手続き型BGMシステム - Web Audio API でSF電子音楽を生成
// タイトル曲 (80BPM 雰囲気系) / バトル曲 (130BPM 疾走感)

export type BgmTrack = 'title' | 'battle'

class BgmSystem {
  private ctx: AudioContext | null = null
  private master: GainNode | null = null
  private playing = false
  private currentTrack: BgmTrack | null = null
  private scheduleTimers: ReturnType<typeof setTimeout>[] = []
  private barCount = 0
  private muted = false

  private getCtx(): AudioContext | null {
    try {
      if (!this.ctx) {
        this.ctx = new AudioContext()
        this.master = this.ctx.createGain()
        this.master.gain.value = 0.22
        this.master.connect(this.ctx.destination)
      }
      if (this.ctx.state === 'suspended') this.ctx.resume()
      return this.ctx
    } catch {
      return null
    }
  }

  start(track: BgmTrack): void {
    if (this.playing && this.currentTrack === track) return
    this.stop()

    const ctx = this.getCtx()
    if (!ctx) return

    this.playing = true
    this.currentTrack = track
    this.barCount = 0

    const bpm = track === 'title' ? 78 : 130
    const barLen = (60 / bpm) * 4

    this.loop(ctx.currentTime + 0.05, bpm, barLen)
  }

  stop(): void {
    this.playing = false
    this.currentTrack = null
    this.scheduleTimers.forEach((t) => clearTimeout(t))
    this.scheduleTimers = []
    this.barCount = 0
  }

  private loop(startTime: number, bpm: number, barLen: number): void {
    if (!this.playing || !this.ctx) return

    if (this.currentTrack === 'title') {
      this.scheduleTitleBar(startTime, bpm)
    } else {
      this.scheduleBattleBar(startTime, bpm)
    }
    this.barCount++

    // 次のバーを事前にスケジュール
    const timer = setTimeout(() => {
      this.loop(startTime + barLen, bpm, barLen)
    }, Math.max(0, (barLen - 0.12) * 1000))

    this.scheduleTimers.push(timer)
  }

  // ── タイトル曲: Am コード基調の静謐なSFアンビエント ──────────
  private scheduleTitleBar(t: number, bpm: number): void {
    const beat = 60 / bpm

    // パッドコード (4拍ごと変化)
    const chords: number[][] = [
      [220, 277, 330, 415], // Am7
      [196, 247, 294, 370], // Gm7
      [175, 220, 261, 329], // Fmaj7
      [196, 247, 294, 370], // Gm7
    ]
    chords.forEach((chord, i) => {
      chord.forEach((freq) => {
        this.playPad(t + i * beat, beat * 0.98, freq, 0.055)
      })
    })

    // スローベース (2拍おき)
    const bassNotes = [110, 0, 98.0, 0, 87.3, 0, 98.0, 0]
    bassNotes.forEach((freq, i) => {
      if (freq > 0) this.playBass(t + i * (beat / 2), beat * 0.38, freq, 0.09)
    })

    // アンビエントリード (2バーに1回)
    if (this.barCount % 2 === 0) {
      const lead = [
        [0.5, 880],
        [1.5, 740],
        [2.0, 830],
        [3.0, 988],
        [3.5, 880],
      ] as [number, number][]
      lead.forEach(([b, freq]) => {
        this.playLead(t + b * beat, beat * 0.55, freq, 0.045)
      })
    }

    // 超低音ドローン (持続)
    this.playDrone(t, beat * 4, 55, 0.06)
  }

  // ── バトル曲: Em コード基調の疾走感あるエレクトロ ──────────────
  private scheduleBattleBar(t: number, bpm: number): void {
    const beat = 60 / bpm
    const step = beat / 4 // 16分音符

    // キック: 1・2.5・3拍目にアクセント
    this.playKick(t, 0.18)
    this.playKick(t + beat * 1.5, 0.1)
    this.playKick(t + beat * 2, 0.18)
    this.playKick(t + beat * 3, 0.1)

    // スネア: 2・4拍目
    this.playSnare(t + beat)
    this.playSnare(t + beat * 3)

    // ハイハット: 16分で刻む (アクセントあり)
    for (let i = 0; i < 16; i++) {
      const accent = i % 4 === 0 ? 0.05 : i % 2 === 0 ? 0.03 : 0.015
      this.playHihat(t + i * step, accent)
    }

    // ベースシンセ (Em ペンタ基調 16ステップ)
    const bassSeq = [
      164.8, 0, 164.8, 123.5,
      130.8, 0, 146.8, 164.8,
      164.8, 0, 196.0, 0,
      174.6, 0, 164.8, 123.5,
    ]
    bassSeq.forEach((freq, i) => {
      if (freq > 0) this.playBass(t + i * step, step * 0.85, freq, 0.13)
    })

    // コードスタブ: 1.5・3.5拍目
    const stabFreqs = [196, 247, 294, 370]
    stabFreqs.forEach((f) => {
      this.playChordStab(t + beat * 1.5, beat * 0.12, f)
      this.playChordStab(t + beat * 3.5, beat * 0.12, f)
    })

    // リードメロディー (2バーに1回)
    if (this.barCount % 2 === 0) {
      const melody: [number, number][] = [
        [0, 392],
        [0.5, 440],
        [1, 392],
        [1.5, 330],
        [2, 392],
        [2.75, 440],
        [3, 494],
        [3.5, 440],
      ]
      melody.forEach(([b, freq]) => {
        this.playLead(t + b * beat, beat * 0.42, freq, 0.07)
      })
    }
  }

  // ── 音色合成メソッド ───────────────────────────────────────────

  private playKick(t: number, vol: number): void {
    const ctx = this.ctx!
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(this.master!)
    osc.frequency.setValueAtTime(200, t)
    osc.frequency.exponentialRampToValueAtTime(28, t + 0.22)
    gain.gain.setValueAtTime(vol, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28)
    osc.start(t)
    osc.stop(t + 0.28)
  }

  private playSnare(t: number): void {
    const ctx = this.ctx!
    // ノイズ成分
    const bufLen = Math.round(ctx.sampleRate * 0.14)
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < bufLen; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / bufLen, 1.2)
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buf
    const hpf = ctx.createBiquadFilter()
    hpf.type = 'highpass'
    hpf.frequency.value = 1800
    const ng = ctx.createGain()
    ng.gain.setValueAtTime(0.07, t)
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.14)
    noise.connect(hpf)
    hpf.connect(ng)
    ng.connect(this.master!)
    noise.start(t)
    noise.stop(t + 0.14)

    // トーン成分
    const osc = ctx.createOscillator()
    const og = ctx.createGain()
    osc.type = 'triangle'
    osc.frequency.value = 160
    og.gain.setValueAtTime(0.04, t)
    og.gain.exponentialRampToValueAtTime(0.001, t + 0.07)
    osc.connect(og)
    og.connect(this.master!)
    osc.start(t)
    osc.stop(t + 0.07)
  }

  private playHihat(t: number, vol: number): void {
    const ctx = this.ctx!
    const bufLen = Math.round(ctx.sampleRate * 0.045)
    const buf = ctx.createBuffer(1, bufLen, ctx.sampleRate)
    const data = buf.getChannelData(0)
    for (let i = 0; i < bufLen; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufLen)
    }
    const noise = ctx.createBufferSource()
    noise.buffer = buf
    const hpf = ctx.createBiquadFilter()
    hpf.type = 'highpass'
    hpf.frequency.value = 9000
    const g = ctx.createGain()
    g.gain.value = vol
    noise.connect(hpf)
    hpf.connect(g)
    g.connect(this.master!)
    noise.start(t)
    noise.stop(t + 0.045)
  }

  private playBass(t: number, dur: number, freq: number, vol: number): void {
    const ctx = this.ctx!
    const osc = ctx.createOscillator()
    osc.type = 'sawtooth'
    osc.frequency.value = freq
    const lpf = ctx.createBiquadFilter()
    lpf.type = 'lowpass'
    lpf.frequency.value = 900
    lpf.Q.value = 3
    const g = ctx.createGain()
    g.gain.setValueAtTime(vol, t)
    g.gain.setValueAtTime(vol * 0.55, t + dur * 0.45)
    g.gain.exponentialRampToValueAtTime(0.001, t + dur)
    osc.connect(lpf)
    lpf.connect(g)
    g.connect(this.master!)
    osc.start(t)
    osc.stop(t + dur)
  }

  private playPad(t: number, dur: number, freq: number, vol: number): void {
    const ctx = this.ctx!
    // 2つのオシレーターをデチューンしてコーラス感
    for (const detune of [-5, 5]) {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq
      osc.detune.value = detune
      const g = ctx.createGain()
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(vol * 0.5, t + dur * 0.08)
      g.gain.setValueAtTime(vol * 0.5, t + dur * 0.85)
      g.gain.linearRampToValueAtTime(0, t + dur)
      osc.connect(g)
      g.connect(this.master!)
      osc.start(t)
      osc.stop(t + dur)
    }
  }

  private playLead(t: number, dur: number, freq: number, vol: number): void {
    const ctx = this.ctx!
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.setValueAtTime(freq * 1.015, t)
    osc.frequency.linearRampToValueAtTime(freq, t + 0.025)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(vol, t + 0.025)
    g.gain.setValueAtTime(vol, t + dur * 0.65)
    g.gain.linearRampToValueAtTime(0, t + dur)
    osc.connect(g)
    g.connect(this.master!)
    osc.start(t)
    osc.stop(t + dur)
  }

  private playChordStab(t: number, dur: number, freq: number): void {
    const ctx = this.ctx!
    const osc = ctx.createOscillator()
    osc.type = 'square'
    osc.frequency.value = freq
    const lpf = ctx.createBiquadFilter()
    lpf.type = 'lowpass'
    lpf.frequency.setValueAtTime(2200, t)
    lpf.frequency.exponentialRampToValueAtTime(400, t + dur)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0.038, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + dur)
    osc.connect(lpf)
    lpf.connect(g)
    g.connect(this.master!)
    osc.start(t)
    osc.stop(t + dur)
  }

  private playDrone(t: number, dur: number, freq: number, vol: number): void {
    const ctx = this.ctx!
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq
    const g = ctx.createGain()
    g.gain.setValueAtTime(vol, t)
    g.gain.setValueAtTime(vol, t + dur - 0.1)
    g.gain.linearRampToValueAtTime(0, t + dur)
    osc.connect(g)
    g.connect(this.master!)
    osc.start(t)
    osc.stop(t + dur)
  }

  // ── 公開API ───────────────────────────────────────────────────

  setMuted(muted: boolean): void {
    this.muted = muted
    if (this.master) this.master.gain.value = muted ? 0 : 0.22
  }

  isMuted(): boolean { return this.muted }

  isPlaying(): boolean { return this.playing }
}

export const bgmSystem = new BgmSystem()
