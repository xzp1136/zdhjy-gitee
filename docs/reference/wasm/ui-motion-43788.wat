  (func (;43788;) (type 2) (param i32 i32 i32)
    (local f32 f32 f32 i32 i32)
    global.get 0
    i32.const 48
    i32.sub
    local.tee 2
    global.set 0
    i32.const 4366992
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3420152
      call 2180
      i32.const 3420192
      call 2180
      i32.const 4366992
      i32.const 1
      i32.store8
    end
    block  ;; label = @1
      local.get 1
      if  ;; label = @2
        local.get 0
        local.get 0
        i64.load offset=60 align=4
        i64.store offset=44 align=4
        local.get 0
        i32.const 52
        i32.add
        local.tee 1
        local.get 0
        i32.load offset=68
        i32.store
        local.get 0
        i32.const 0
        call 48735
        local.set 6
        local.get 0
        f32.load offset=48
        local.set 4
        local.get 0
        f32.load offset=44
        local.set 5
        local.get 2
        i32.const 40
        i32.add
        local.tee 7
        local.get 1
        f32.load
        local.get 0
        f32.load offset=56
        local.tee 3
        f32.mul
        f32.store
        local.get 2
        local.get 7
        i32.load
        i32.store offset=8
        local.get 2
        local.get 4
        local.get 3
        f32.mul
        f32.store offset=36
        local.get 2
        local.get 5
        local.get 3
        f32.mul
        f32.store offset=32
        local.get 2
        local.get 2
        i64.load offset=32
        i64.store
        local.get 0
        local.get 6
        local.get 2
        f32.const 0x1.99999ap+0 (;=1.6;)
        i32.const 0
        call 7781
        i32.const 7
        i32.const 3420152
        i32.load
        call 14789
        i32.const -1
        i32.const 1
        i32.const 3420192
        i32.load
        call 14801
        i32.store offset=92
        br 1 (;@1;)
      end
      local.get 0
      i32.const 0
      call 48735
      local.set 1
      local.get 2
      local.get 0
      i32.load offset=68
      i32.store offset=24
      local.get 2
      local.get 0
      i64.load offset=60 align=4
      i64.store offset=16
      local.get 1
      local.get 2
      i32.const 16
      i32.add
      i32.const 0
      call 49495
      local.get 0
      i32.load offset=92
      local.tee 1
      i32.eqz
      br_if 0 (;@1;)
      local.get 1
      i32.const 0
      i32.const 0
      call 7683
      local.get 0
      i32.const 0
      i32.store offset=92
    end
    local.get 2
    i32.const 48
    i32.add
    global.set 0)
