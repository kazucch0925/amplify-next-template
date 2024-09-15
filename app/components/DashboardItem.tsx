import React from 'react';
//import './DashboardItem.css';
import Link from 'next/link';

export default function DashboardItem({
    title,
    icon,
    disabled,
    link,
    onClick
}: {
    title?: String;
    icon?: String;
    disabled?: Boolean;
    link?: String;
    onClick?: () => void;
}) {
    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!disabled && onClick) {
            e.preventDefault(); // デフォルトのリンク動作をキャンセル
            onClick(); // onClickハンドラーを実行
        }
    };

    return (
        <>
            {link ? (
                <Link href={typeof link === 'string' ? (disabled ? '#' : link) : '#'} passHref>
                    <div className={`dashboard-item ${disabled ? 'disabled' : ''}`} onClick={handleClick}>
                        <img src={`/icons/${icon}`} alt={`${title} icon`} className="item-icon" />
                        <h3 className="item-title">{title}</h3>
                    </div>
                </Link>
            ) : (
                <div className={`dashboard-item ${disabled ? 'disabled' : ''}`} onClick={handleClick}>
                    <img src={`/icons/${icon}`} alt={`${title} icon`} className="item-icon" />
                    <h3 className="item-title">{title}</h3>
                </div>
            )}
        </>
    );
}
