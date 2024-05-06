export class AudioPlayer {
    
    #announce_voices;
    #voice_type;
    #exam_voices;

    #audioList;
    
    constructor(announce_voices, voice_type) {
        this.#audioList = {};
        const create_audio = (audio_name) => {
            this.#audioList[audio_name] = new Audio();
        };
        create_audio('directions');
        create_audio('announce_a');
        create_audio('announce_b');
        create_audio('announce_c');
        create_audio('announce_correct');
        create_audio('announce_incorrect');
        create_audio('announce_correct_answer_is');
        create_audio('announce_perfect');
        create_audio('announce_excellent');
        create_audio('announce_welldone');
        create_audio('announce_go_for_it');
        create_audio('announce_number');
        create_audio('exam_question');
        create_audio('exam_answer_a');
        create_audio('exam_answer_b');
        create_audio('exam_answer_c');

        this.#announce_voices = announce_voices;
        this.voice_type = voice_type;
    };

    get voice_type() {
        return this.#voice_type;
    }; 

    set voice_type(voice_type) {
        this.#voice_type = voice_type;

        const setLabelAudio = (audio_name, label) => {
            this.#audioList[audio_name].src = this.#announce_voices[this.#voice_type]["label"][label];
            this.#audioList[audio_name].load();
        };
        setLabelAudio('announce_a', "A");
        setLabelAudio('announce_b', "B");
        setLabelAudio('announce_c', "C");

        const setAnnounceAudio = (audio_name, type) => {
            this.#audioList[audio_name].src = this.#announce_voices[this.#voice_type]["announce"][type];
            this.#audioList[audio_name].load();
        };
        setAnnounceAudio('announce_correct', "correct");
        setAnnounceAudio('announce_incorrect', "incorrect");
        setAnnounceAudio('announce_correct_answer_is', "correct_answer_is");
        setAnnounceAudio('announce_perfect', "perfect");
        setAnnounceAudio('announce_excellent', "excellent");
        setAnnounceAudio('announce_welldone', "welldone");
        setAnnounceAudio('announce_go_for_it', "go_for_it");
    };

    set_exam(number, voices) {
        this.#exam_voices = voices;

        this.#audioList['announce_number'].src = this.#announce_voices[this.#voice_type]["number"][number];
        this.#audioList['announce_number'].load();

        this.#audioList['exam_question'].src = this.#exam_voices[this.#voice_type]["Question"];
        this.#audioList['exam_question'].load();

        this.#audioList['exam_answer_a'].src = this.#exam_voices[this.#voice_type]["AnswerA"];
        this.#audioList['exam_answer_a'].load();

        this.#audioList['exam_answer_b'].src = this.#exam_voices[this.#voice_type]["AnswerB"];
        this.#audioList['exam_answer_b'].load();

        this.#audioList['exam_answer_c'].src = this.#exam_voices[this.#voice_type]["AnswerC"];
        this.#audioList['exam_answer_c'].load();
    };

    play_directions(part, exam_count) {
        this.#audioList['directions'].src = this.#announce_voices[this.#voice_type]["directions"][part][exam_count];
        this.#audioList['directions'].load();
        this.#playAudio('directions');
    };

    play_exam(num, exam) {
        this.set_exam(num, exam);
        this.replay_exam();
    };

    replay_exam() {
        this.#playAudioList([
            'announce_number',
            'exam_question',
            'announce_a',
            'exam_answer_a',
            'announce_b',
            'exam_answer_b',
            'announce_c',
            'exam_answer_c'
        ]);
    }

    replay_question() {
        this.#playAudioList([
            'exam_question'
        ]);
    };

    replay_answer(label) {
        this.#playAudioList([
            'announce_' + label.toLowerCase(),
            'exam_answer_'  + label.toLowerCase()
        ]);
    };

    play_correct() {
        this.#playAudioList([
            'announce_correct'
        ]);
    };

    play_incorrect(correct_label) {
        this.#playAudioList([
            'announce_incorrect',
            'announce_correct_answer_is',
            'announce_' + correct_label.toLowerCase(),
            'exam_answer_'  + correct_label.toLowerCase()
        ]);
    };

    play_result(result) {
        this.#playAudioList([
            'announce_' + result
        ]);
    }

    stop() {
        for (const [audio_name, player] of Object.entries(this.#audioList)) {
            player.pause();
            player.currentTime = 0;
        };
    };

    async #playAudio(audio_name) {
        const play = (a) => {
            return new Promise(resolve => {
                a.play()
                .then(_ => {
                    a.onended = resolve;
                })
                .catch(err => {
                   console.log(err); 
                });
            });
        };
        await play(this.#audioList[audio_name]);
    };
      
    async #playAudioList(audioNameList) {
        this.stop();
        for (let i = 0; i < audioNameList.length; i++ ) {
            await this.#playAudio(audioNameList[i]);
        }
    };
};