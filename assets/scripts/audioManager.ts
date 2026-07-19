import { _decorator, Node, AudioClip, AudioSource, game, director } from "cc";
import { ResourceUtil } from "./resourceUtil";

interface AudioData {
    source: AudioSource;
    isMusic: boolean;
}

interface AudioDataMap {
    [name: string]: AudioData;
}
export class AudioManager {
    public musicVolume: number = 0.8;
    public soundVolume: number = 1;
    public audios: AudioDataMap = {};
    public arrSound: AudioData[] = [];
    public dictWeaponSoundIndex: any = {};

    public static _instance: AudioManager;
    public static get instance () {
        if (this._instance) {
            return this._instance;
        }

        this._instance = new AudioManager();
        return this._instance;
    }

    private _persistRootNode: Node = null!;
    private _audioSources: AudioSource[] = [];

    public init () {
        if (this._persistRootNode) return; //避免切换场景初始化报错
        this._persistRootNode = new Node('audio');
        director.getScene()!.addChild(this._persistRootNode);
        game.addPersistRootNode(this._persistRootNode)

        this.musicVolume = this.getAudioSetting(true) ? 0.8 : 0;
        this.soundVolume = this.getAudioSetting(false) ? 1 : 0;
    }

    private _getAudioSource (clip: AudioClip) {
        let result: AudioSource | undefined;
        for (let i = 0; i < this._audioSources.length; ++i) {
            let audioSource = this._audioSources[i];
            if (!audioSource.playing) {
                result = audioSource;
                break;
            }
        }
        if (!result) {
            result = this._persistRootNode.addComponent(AudioSource);
            this._audioSources.push(result);
        }
        result.node.off(AudioSource.EventType.ENDED);
        result.clip = clip;
        result.currentTime = 0;
        return result;
    }

    public getAudioSetting (isMusic: boolean) {
        let state;
        return !state || state === 'true' ? true : false;
    }

    /**
     * 播放音乐
     * @param {String} name 音乐名称可通过Constant.AUDIO_MUSIC 获取
     * @param {Boolean} loop 是否循环播放
     */
    public playMusic (name: string, loop: boolean) {
        let path = 'audio/music/' + name;
        //微信特殊处理，除一开场的音乐，其余的放在子包里头
        // if (name !== 'click') {
        //     path =  path; //微信特殊处理，除一开场的音乐，其余的放在子包里头
        // }

        ResourceUtil.loadRes(path, AudioClip).then((clip: any) => {
            let source = this._getAudioSource(clip);
            let tmp: AudioData = {
                source,
                isMusic: true,
            };
            this.audios[name] = tmp;
            source.volume = this.musicVolume;
            source.loop = loop;
            source.play();
        })
    }

    /**
     * 播放音效
     * @param {String} name 音效名称可通过Constant.AUDIO_SOUND 获取
     * @param {Boolean} loop 是否循环播放
     */
    public playSound (name: string, loop: boolean = false) {
        if (!this.soundVolume) {
            return;
        }

        //音效一般是多个的，不会只有一个
        let path = 'audio/sound/';
        // if (name !== 'click') {
        //     path = path; //微信特殊处理，除一开场的音乐，其余的放在子包里头
        // }

        ResourceUtil.loadRes(path + name, AudioClip).then((clip: any) => {
            let source = this._getAudioSource(clip);
            let tmp: AudioData = {
                source,
                isMusic: false,
            };
            this.arrSound.push(tmp);

            if (loop) {
                this.audios[name] = tmp;
            }

            source.volume = this.soundVolume;
            source.loop = loop;
            source.play();

            source.node.on(AudioSource.EventType.ENDED, () => {
                for (let i = 0; i < this.arrSound.length; i++) {
                    if (this.arrSound[i].source == source) {
                        this.arrSound.splice(i, 1);
                        i--;
                    }
                }
            });
        });
    }

    public stop (name: string) {
        if (this.audios.hasOwnProperty(name)) {
            let audio = this.audios[name];
            audio.source.stop();
        }
    }

    public stopAll () {
        for (const i in this.audios) {
            if (this.audios.hasOwnProperty(i)) {
                let audio = this.audios[i];
                audio.source.stop();
            }
        }
    }

    public getMusicVolume () {
        return this.musicVolume;
    }

    public setMusic (flag: number) {
        this.musicVolume = flag;
        for (let item in this.audios) {
            if (this.audios.hasOwnProperty(item) && this.audios[item].isMusic) {
                // this.changeState(item, flag);
                let audio = this.audios[item];
                audio.source.volume = this.musicVolume;
            }
        }
    }

    //看广告时先将音乐暂停
    public pauseAll () {
        console.log("pause all music!!!");

        for (let item in this.audios) {
            if (this.audios.hasOwnProperty(item)) {
                let audio = this.audios[item];
                audio.source.pause();
            }
        }
    }

    public resumeAll () {
        for (let item in this.audios) {
            if (this.audios.hasOwnProperty(item)) {
                let audio = this.audios[item];
                audio.source.play();
            }
        }
    }

    public setSound (flag: number) {
        this.soundVolume = flag;
        for (let item in this.audios) {
            if (this.audios.hasOwnProperty(item) && !this.audios[item].isMusic) {
                // this.changeState(item, flag);
                let audio = this.audios[item];
                audio.source.volume = this.soundVolume;
            }
        }

        for (let idx = 0; idx < this.arrSound.length; idx++) {
            let audio = this.arrSound[idx];
            audio.source.volume = this.soundVolume;
        }
    }

    public stopSingleSound (name: string) {
        if (this.audios.hasOwnProperty(name) && !this.audios[name].isMusic) {
            let audio = this.audios[name];
            audio.source.stop();
        }
    }
}
