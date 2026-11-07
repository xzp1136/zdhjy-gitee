  (func (;40916;) (type 1) (param i32 i32)
    (local i32)
    i32.const 4365063
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3354788
      call 2180
      i32.const 3360788
      call 2180
      i32.const 4365063
      i32.const 1
      i32.store8
    end
    local.get 0
    i32.load offset=8
    local.set 1
    i32.const 3360788
    i32.load
    local.tee 2
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 2
      call 60460
    end
    block  ;; label = @1
      local.get 1
      i32.const 0
      i32.const 0
      call 48872
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=8
      local.tee 1
      i32.load8_u offset=96
      br_if 0 (;@1;)
      local.get 1
      i32.load8_u offset=128
      br_if 0 (;@1;)
      block (result i32)  ;; label = @2
        i32.const 1
        local.get 0
        i32.load offset=16
        i32.const 2
        i32.ne
        br_if 0 (;@2;)
        drop
        i32.const 1
        local.get 0
        i32.load offset=20
        i32.const 1
        i32.ne
        br_if 0 (;@2;)
        drop
        local.get 1
        f32.const 0x1p+0 (;=1;)
        i32.const 0
        call 44369
        local.get 0
        i32.load offset=8
        local.set 1
        i32.const 0
      end
      local.set 2
      local.get 1
      local.get 0
      i32.load offset=20
      local.get 0
      i32.load offset=24
      i32.const 0
      call 44358
      local.get 0
      i32.const 1
      i32.store8 offset=28
      local.get 2
      i32.eqz
      if  ;; label = @2
        local.get 0
        i32.load offset=8
        f32.const 0x1.e66666p-1 (;=0.95;)
        f32.const 0x1p-1 (;=0.5;)
        local.get 0
        f32.load offset=12
        f32.const 0x1p-1 (;=0.5;)
        f32.mul
        i32.const 0
        call 44383
      end
      local.get 0
      i32.load8_u offset=29
      i32.eqz
      if  ;; label = @2
        local.get 0
        i32.load offset=32
        local.get 0
        i32.load offset=8
        i32.const 0
        call 44427
        local.get 0
        i32.const 1
        i32.store8 offset=29
      end
      local.get 0
      i32.load offset=20
      br_if 0 (;@1;)
      local.get 0
      i32.load offset=8
      i32.load offset=68
      i32.const 0
      call 43916
      br_if 0 (;@1;)
      i32.const 3354788
      i32.load
      local.tee 1
      i32.load offset=116
      i32.eqz
      if  ;; label = @2
        local.get 1
        call 60460
      end
      call 43450
      local.tee 1
      i32.eqz
      br_if 0 (;@1;)
      local.get 1
      local.get 0
      i32.load offset=8
      i32.load offset=68
      i32.const 0
      call 44254
    end)
