import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const postsDirectory = path.join(process.cwd(), 'posts');

export function getAllPostIds() {
    const fileNames = fs.readdirSync(postsDirectory);

    // 以下の形式の配列を返す:
    // [
    //   {
    //      params: {
    //          id: 'ssg-ssr'
    //      },     
    //   },
    //   {
    //      params: {
    //          id: 'pre-rendering'
    //      },     
    //   },
    // ]     

    return fileNames.map((fileName) => {   
        return {
            params: {
                id: fileName.replace(/\.md$/, ''),
            }
        }
    });
}

export async function getPostData(id) {
    const fullPath = path.join(postsDirectory, `${id}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');

    // 投稿のメタデータ部分を解析するためにgray-matterを使う
    const matterResult = matter(fileContents);

    // マークダウンをHTML文字列に変換するためにremarkを使う
    const processedContent = await remark()
        .use(html)
        .process(matterResult.content);
    const contentHtml = processedContent.toString();

    // データをidおよびcontentHtmlと合体させる
    return {
        id,
        contentHtml,
        ...matterResult.data,
    };
}

export function getSortedPostsData() {
    //  /posts以下のファイル名を取得する
    const fileNames = fs.readdirSync(postsDirectory);
    const allPostsData = fileNames.map((fileName) => {
        // idを取得するためにファイル名から".md"を削除する
        const id = fileName.replace(/\.md$/, '');

        // マークダウンファイルを文字列として読み取る
        const fullPath = path.join(postsDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        // 投稿のメタデータ部分を解析するためにgray-matterを使う
        const matterResult = matter(fileContents);

        // データをidと合わせる
        return {
            id,
            ...matterResult.data,
        };
    });

    // 投稿を日付でソートする
    return allPostsData.sort((a, b) => {
        if (a.date < b.date) {
            return 1;
        } else {
            return -1;
        }
    });
}
