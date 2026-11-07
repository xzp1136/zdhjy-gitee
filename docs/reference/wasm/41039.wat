  (func (;41039;) (type 9) (param i32 i32 i32 i32 i32) (result i32)
    (local i32 i32)
    global.get 0
    i32.const 16
    i32.sub
    local.tee 5
    global.set 0
    i32.const 0
    local.set 0
    i32.const 4365137
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3357348
      call 2180
      i32.const 3389752
      call 2180
      i32.const 3389756
      call 2180
      i32.const 3434324
      call 2180
      i32.const 4365137
      i32.const 1
      i32.store8
    end
    block  ;; label = @1
      local.get 2
      i32.eqz
      br_if 0 (;@1;)
      local.get 2
      i32.load offset=16
      local.tee 4
      i32.eqz
      br_if 0 (;@1;)
      local.get 4
      i32.load offset=12
      local.tee 4
      i32.const 0
      i32.le_s
      br_if 0 (;@1;)
      local.get 2
      i32.load offset=20
      local.tee 6
      i32.eqz
      br_if 0 (;@1;)
      local.get 6
      i32.load offset=12
      local.tee 6
      i32.const 0
      i32.le_s
      br_if 0 (;@1;)
      i32.const 0
      local.get 4
      local.get 6
      local.get 4
      local.get 6
      i32.lt_u
      select
      i32.const 0
      call 48614
      local.set 4
      i32.const 3357348
      i32.load
      call 1900
      local.tee 0
      local.get 1
      i32.store offset=8
      local.get 2
      i32.load offset=12
      local.set 1
      local.get 0
      local.get 3
      i32.store offset=16
      local.get 0
      local.get 1
      i32.store offset=12
      local.get 0
      f32.const -0x1.68p+7 (;=-180;)
      f32.const 0x1.68p+7 (;=180;)
      i32.const 0
      call 48613
      f32.store offset=20
      local.get 0
      local.get 2
      f32.load offset=36
      f32.store offset=24
      local.get 2
      i32.load offset=16
      local.get 4
      local.get 5
      i32.const 8
      i32.add
      i32.const 3389756
      i32.load
      call 50458
      local.get 0
      local.get 5
      i32.load offset=8
      i32.store offset=28
      local.get 2
      i32.load offset=20
      local.get 4
      local.get 5
      i32.const 12
      i32.add
      i32.const 3389756
      i32.load
      call 50458
      local.get 0
      local.get 5
      i32.load offset=12
      i32.store offset=32
      local.get 0
      i32.const 3434324
      local.get 2
      i32.const 44
      i32.add
      local.get 2
      i32.load offset=44
      i32.const 0
      call 48223
      select
      i32.load
      i32.store offset=36
      local.get 0
      local.get 2
      i32.load offset=28
      i32.store offset=40
    end
    local.get 5
    i32.const 16
    i32.add
    global.set 0
    local.get 0)
