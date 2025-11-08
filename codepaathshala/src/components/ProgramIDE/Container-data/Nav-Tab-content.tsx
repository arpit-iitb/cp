function NavTabContent({ activeTab, tabs }: any) {
    const activeTabItem = tabs.find((tab:any) => tab.id === activeTab);
    return <>
        <div className="m-3">
            {activeTabItem && (
                <section key={activeTabItem.id} id={activeTabItem.id} className="">
                   {activeTabItem.content}
                </section>
            )}
        </div>
    </>

}
export default NavTabContent;