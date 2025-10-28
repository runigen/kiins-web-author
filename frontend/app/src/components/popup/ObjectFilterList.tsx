import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import store from '../../store';
import * as DataStore from '../../store/DataStore';
// import $ from 'jquery';
import {
    cancelBubble,
    // checkUserId,
    // getUserIdErrorMsg,
} from '../../util/common';
import {
    EuserLang,
    EResouce_Filter_List_Type,
    // IResouceFilterProps,
} from '../../const/types';
// import { showToastMessage } from '../../util/dialog';

interface IResourceFilterListCB {
    (filterList: EResouce_Filter_List_Type[]): void;
}
interface TFilterInfo {
    filterType: string;
    setResourceFilterListCB: IResourceFilterListCB;
}
type TFilterProps = {
    filterInfo: TFilterInfo;
};

export const closeAllObjectFilterContainer = () => {
    const targetContainer = document.querySelectorAll(
        '.object-filter-container',
    ) as NodeListOf<HTMLDivElement>;
    targetContainer.forEach((item: HTMLDivElement) => {
        item.classList.remove('active');
    });
};
const showObjectFilterContainer = (bShow = true, parentObj: HTMLElement) => {
    if (parentObj === null) return;
    const filterContainer = parentObj.querySelector(
        '.object-filter-container',
    ) as HTMLDivElement;
    if (filterContainer === null) return;
    if (bShow) {
        filterContainer.classList.add('active');

        // 보이는 화면 높이값
        const viewHeight = window.innerHeight;
        console.log('showObjectFilterContainer viewHeight : ', viewHeight);

        // parentObj 의 bottom 값
        const parentObjBottom = parentObj.getBoundingClientRect().bottom;
        console.log(
            'showObjectFilterContainer parentObjBottom : ',
            parentObjBottom,
        );

        // filterContainer 의 height 값
        const filterContainerHeight =
            filterContainer.getBoundingClientRect().height;
        console.log(
            'showObjectFilterContainer filterContainerHeight : ',
            filterContainerHeight,
        );
        const filterContainerWidth =
            filterContainer.getBoundingClientRect().width;
        const filterContainerLeft =
            filterContainer.getBoundingClientRect().left;

        // filterContainer 의 top 값이 보이는 화면 높이값 보다 크면 버튼 위쪽으로 보이게 (+20 은 여유값)
        if (parentObjBottom + filterContainerHeight + 20 > viewHeight) {
            filterContainer.classList.add('top');
        } else {
            filterContainer.classList.remove('top');
        }

        // filterContainer 의 left 값이 보이는 화면 높이값 보다 크면 버튼 왼쪽으로 보이게 (+20 은 여유값)
        if (
            filterContainerWidth + filterContainerLeft + 20 >
            window.innerWidth
        ) {
            filterContainer.classList.add('left');
        } else {
            filterContainer.classList.remove('left');
        }
    } else {
        filterContainer.classList.remove('active');
        filterContainer.classList.remove('top');
        filterContainer.classList.remove('left');
    }
};
export const toggleShowResourcesFilter = (parentObj: HTMLElement) => {
    if (parentObj === null) return;
    const filterContainer = parentObj.querySelector(
        '.object-filter-container',
    ) as HTMLDivElement;
    if (filterContainer === null) return;
    if (filterContainer.classList.contains('active')) {
        showObjectFilterContainer(false, parentObj);
    } else {
        showObjectFilterContainer(true, parentObj);
    }
};

const ObjectFilterList = observer(({ filterInfo }: TFilterProps) => {
    const { userInfo, workInfo } = store;
    const [userId, setUserId] = useState('');
    const [userLangList, setUserLangList] = useState<EuserLang[]>([]);
    // const userLang = userInfo.getLang();
    const [userLang, setUserLang] = useState<EuserLang>(userInfo.getLang());
    const [printFilterList, setPrintFilterList] = useState<
        EResouce_Filter_List_Type[]
    >([]);

    useEffect(() => {
        console.log('filterInfo:: ', filterInfo.filterType);
        setUserId(DataStore.getUserId());
        setUserLangList(Object.values(EuserLang));
        setFilterDataList();
    }, []);

    useEffect(() => {
        console.log('printFilterList:: ', printFilterList);
    }, [printFilterList]);

    const setFilterDataList = () => {
        console.log('filterInfo filterType', filterInfo.filterType);

        // const allList = Array.from(Object.values(EResouce_Filter_List_Type));
        const newList: EResouce_Filter_List_Type[] = [
            EResouce_Filter_List_Type.image,
            EResouce_Filter_List_Type.movie,
            EResouce_Filter_List_Type.audio,
        ];

        if (filterInfo.filterType === 'resource') {
            newList.push(EResouce_Filter_List_Type.text);
        }

        if (
            filterInfo.filterType === 'logic-object' ||
            filterInfo.filterType === 'timeline'
        ) {
            newList.push(EResouce_Filter_List_Type.shape);
            newList.push(EResouce_Filter_List_Type.youtube);
        }
        // 인터렉션 필터링은 임시로 제외 (2023.06.22 : off, on 어떤것을 출력해도 모두 보이지 않음)
        // if (filterInfo.filterType === 'timeline') {
        //     newList.push(EResouce_Filter_List_Type.interacted);
        // }

        console.log('filterInfo filterType newList', newList);
        setPrintFilterList(newList);
        filterInfo.setResourceFilterListCB(newList);
    };

    const setCurrFilter = (e: React.MouseEvent<HTMLDivElement>) => {
        const obj = e.currentTarget as HTMLDivElement;
        obj.classList.toggle('active');

        // const listContainer = document.querySelectorAll(
        //     '.object-filter-container .list.active',
        // ) as NodeListOf<HTMLDivElement>;
        const listContainer = obj.parentElement?.querySelectorAll(
            `.list.active`,
        ) as NodeListOf<HTMLDivElement>;

        const filterList: EResouce_Filter_List_Type[] = [];
        listContainer.forEach((item: HTMLDivElement) => {
            filterList.push(item.innerText as EResouce_Filter_List_Type);
        });
        filterInfo.setResourceFilterListCB(filterList);
        cancelBubble(e);
    };

    return (
        <div className="object-filter-container">
            {printFilterList.map((filter: string) => (
                <div
                    key={filter}
                    className={`list active ${filter}`}
                    onClick={setCurrFilter}
                >
                    {filter}
                </div>
            ))}
        </div>
    );
});

export default ObjectFilterList;
