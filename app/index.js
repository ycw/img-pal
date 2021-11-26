import * as Vue from 'https://unpkg.com/vue@3.2.22/dist/vue.esm-browser.prod.js';
import * as lib from './lib.js';

// ---
// cache 
// ---

let abRecords; // arrbuf
let abGroupedRecords; // arrbuf
let pixelsCount;

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
      if (e.target.files.length === 0) return;

      this.isProcessing = true;
      const reader = new FileReader();

      reader.onload = async () => {
        this.imgUrl = reader.result;
        try {
          const img = await lib.loadImage(this.imgUrl);
          pixelsCount = img.width * img.height;
          abRecords = lib.genAbRecords(lib.getImageData(img));
          ({ abRecords, abGroupedRecords } = await lib.groupAbRecords(abRecords, this.similarity));
          this.records = lib.intoRecords(abGroupedRecords, pixelsCount, this.colorFormat);
        } catch (e) {
          this.imgUrl = '';
          alert(e);
          throw e;
        } finally {
          this.isProcessing = false;
        }
      };

      reader.onerror = (e) => {
        this.imgUrl = '';
        this.isProcessing = false;
        alert(e);
      };

      reader.readAsDataURL(e.target.files[0]);
    },

    async handleSimilarity() {
      this.isProcessing = true;
      try {
        ({ abRecords, abGroupedRecords } = await lib.groupAbRecords(abRecords, this.similarity));
        this.records = lib.intoRecords(abGroupedRecords, pixelsCount, this.colorFormat);
      } catch (e) {
        alert(e);
        throw e;
      } finally {
        this.isProcessing = false;
      }
    },

    handleColorFormat() {
      this.isProcessing = true;
      this.records = lib.intoRecords(abGroupedRecords, pixelsCount, this.colorFormat);
      this.isProcessing = false;
    }
  }
};

const app = Vue.createApp(appDescriptor).mount('#app');