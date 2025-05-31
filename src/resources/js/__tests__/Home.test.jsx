// __tests__/Home.test.jsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../Pages/Home';

// グローバルな route モック（すでにある場合）
global.route = (name) => {
  if (name) {
    return `/dummy-url-for-${name}`;
  }
  return {
    current: (currentRouteName) => currentRouteName === 'home',
  };
};

// @inertiajs/react の必要なエクスポートをすべてモックする
vi.mock('@inertiajs/react', () => {
  return {
    // Inertia が内部で呼び出す createProvider をモックで定義
    createProvider: () => () => null,
    // Home や AuthenticatedLayout 内で使われる usePage もモックする
    usePage: () => ({
      props: {
        auth: {
          user: { name: 'John Doe' },
        },
        exampleData: 'テスト用データ',
      },
    }),
    // 必要なら Head, Link などもモックする
    Head: (props) => <>{props.children}</>,
    Link: (props) => <a {...props} />,
    // 他のエクスポートも必要に応じて追加
  };
});

describe('Home Component', () => {
  test('Home画面に「今週のタスク」が表示されるかどうかを確認します。', () => {
    render(<Home />);
    const headingElement = screen.getByRole('heading', {
      name: /今週のタスク/i,
    });
    expect(headingElement).toBeInTheDocument();
  });
});