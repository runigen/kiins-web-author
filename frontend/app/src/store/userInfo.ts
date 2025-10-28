import { observable } from 'mobx';
import { IuserInfo, EuserLang } from '../const/types';
import * as EN from '../const/lang/en';
import * as KO from '../const/lang/ko';
import { getEnvLang, getLangSet } from '../util/common';
import { getUserLang, setUserLang } from './DataStore';

const INIT_LANG = getUserLang();
const INIT_LANG_SET = getLangSet(INIT_LANG);

const userInfo = observable({
    dataset: {
        name: '',
        id: '',
        lang: INIT_LANG,
        langSet: INIT_LANG_SET,
    } as IuserInfo,
    setList(data: IuserInfo) {
        this.dataset = data;
    },
    getList() {
        return this.dataset;
    },
    setId(id: string) {
        this.setList({
            ...this.dataset,
            id: id,
        });
    },
    getId() {
        return this.dataset.id;
    },
    setName(name: string) {
        this.setList({
            ...this.dataset,
            name: name,
        });
    },
    getName() {
        return this.dataset.name;
    },
    setLang(lang: EuserLang) {
        this.setList({
            ...this.dataset,
            lang: lang,
        });
        setUserLang(lang);
    },
    getLang() {
        return this.dataset.lang;
    },
    setLangSet(langSet: any) {
        this.setList({
            ...this.dataset,
            langSet: langSet,
        });
    },
    getLangSet() {
        return this.dataset.langSet;
    },
});

export default userInfo;
