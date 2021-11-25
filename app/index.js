import * as Vue from 'https://unpkg.com/vue@3.2.22/dist/vue.esm-browser.prod.js';
import * as lib from './lib.js';

const wk = new Worker('./worker.js');
wk.onmessage = (e) => {
  switch (e.data.cmd) {
    case 'groupSimilar':
      similarRawRecords = e.data.result;
      app.records = lib.intoRecords(similarRawRecords, app.colorFormat);
      app.isProcessing = false;
      break;
  }
}

let rawRecords = [];
let similarRawRecords = [];

const appDescriptor = {
  template: document.querySelector('#tmpl-app'),
  data() {
    return {
      imgUrl: '',
      similarity: 100,
      colorFormat: 'hex',
      isProcessing: false,
      records: [],
    }
  },
  methods: {
    handleFile(e) {
      this.isProcessing = true;
      const reader = new FileReader();

      reader.onload = async () => {
        this.imgUrl = reader.result;
        let img;
        try {
          img = await lib.loadImage(this.imgUrl);
        } catch (e) {
          this.imgUrl = '';
          this.isProcessing = false;
          return alert(e);
        }

        rawRecords = lib.countPixels(lib.getImageData(img));
        wk.postMessage({
          cmd: 'groupSimilar',
          similarity: this.similarity,
          rawRecords
        });
      };

      reader.onerror = (e) => {
        alert(e);
        this.imgUrl = '';
        this.isProcessing = false;
      };

      reader.readAsDataURL(e.target.files[0]);
    },

    handleSimilarity() {
      this.isProcessing = true;
      wk.postMessage({
        cmd: 'groupSimilar',
        similarity: this.similarity,
        rawRecords
      });
    },

    handleColorFormat() {
      this.isProcessing = true;
      this.records = lib.intoRecords(similarRawRecords, this.colorFormat);
      this.isProcessing = false;
    }
  }
};

const app = Vue.createApp(appDescriptor).mount('#app');