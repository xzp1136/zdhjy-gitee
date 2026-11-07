  (func (;44279;) (type 2) (param i32 i32 i32)
    (local i32 i32 i32 i32 i32 i32)
    global.get 0
    i32.const 48
    i32.sub
    local.tee 3
    global.set 0
    i32.const 4367317
    i32.load8_u
    i32.eqz
    if  ;; label = @1
      i32.const 3403260
      call 2180
      i32.const 3360788
      call 2180
      i32.const 3361196
      call 2180
      i32.const 4367317
      i32.const 1
      i32.store8
    end
    i32.const 0
    call 55597
    local.set 2
    local.get 3
    local.get 1
    i32.load offset=8
    i32.store offset=16
    local.get 3
    local.get 1
    i64.load align=4
    i64.store offset=8
    local.get 3
    i32.const 32
    i32.add
    local.get 2
    local.get 3
    i32.const 8
    i32.add
    i32.const 0
    call 55574
    local.get 3
    i32.load offset=36
    local.set 1
    local.get 3
    i32.load offset=32
    local.set 2
    local.get 0
    i32.load offset=48
    local.set 4
    local.get 0
    i32.load offset=44
    local.set 5
    i32.const 3361196
    i32.load
    local.tee 6
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 6
      call 60460
    end
    local.get 3
    local.get 1
    i32.store offset=28
    local.get 3
    local.get 2
    i32.store offset=24
    local.get 3
    local.get 3
    i64.load offset=24
    i64.store
    block  ;; label = @1
      local.get 3
      local.get 4
      local.get 5
      i32.const 0
      call 20345
      local.tee 5
      i32.const 0
      i32.le_s
      br_if 0 (;@1;)
      i32.const -2147483648
      local.set 6
      i32.const 0
      local.set 1
      loop  ;; label = @2
        local.get 0
        i32.load offset=48
        local.get 1
        i32.const 2
        i32.shl
        i32.add
        i32.load offset=16
        local.set 2
        i32.const 3360788
        i32.load
        local.tee 4
        i32.load offset=116
        i32.eqz
        if  ;; label = @3
          local.get 4
          call 60460
        end
        block  ;; label = @3
          local.get 2
          i32.const 0
          i32.const 0
          call 48872
          br_if 0 (;@3;)
          local.get 2
          local.get 3
          i32.const 32
          i32.add
          i32.const 3403260
          i32.load
          call 45310
          local.get 3
          i32.load offset=32
          local.set 2
          i32.const 3360788
          i32.load
          local.tee 4
          i32.load offset=116
          i32.eqz
          if  ;; label = @4
            local.get 4
            call 60460
          end
          local.get 2
          i32.const 0
          i32.const 0
          call 48872
          br_if 0 (;@3;)
          local.get 2
          i32.load8_u offset=96
          br_if 0 (;@3;)
          local.get 2
          local.get 1
          call 44281
          local.tee 4
          local.get 6
          local.get 4
          local.get 6
          i32.gt_s
          local.tee 4
          select
          local.set 6
          local.get 2
          local.get 7
          local.get 4
          select
          local.set 7
        end
        local.get 1
        i32.const 1
        i32.add
        local.tee 1
        local.get 5
        i32.ne
        br_if 0 (;@2;)
      end
      local.get 5
      i32.const 0
      i32.le_s
      br_if 0 (;@1;)
      local.get 5
      i32.const 3
      i32.and
      local.set 6
      i32.const 0
      local.set 4
      i32.const 0
      local.set 1
      local.get 5
      i32.const 1
      i32.sub
      i32.const 3
      i32.ge_u
      if  ;; label = @2
        local.get 5
        i32.const -4
        i32.and
        local.set 8
        i32.const 0
        local.set 5
        loop  ;; label = @3
          local.get 1
          i32.const 2
          i32.shl
          local.tee 2
          local.get 0
          i32.load offset=48
          i32.add
          i32.const 0
          i32.store offset=16
          local.get 0
          i32.load offset=48
          local.get 2
          i32.const 4
          i32.or
          i32.add
          i32.const 0
          i32.store offset=16
          local.get 0
          i32.load offset=48
          local.get 2
          i32.const 8
          i32.or
          i32.add
          i32.const 0
          i32.store offset=16
          local.get 0
          i32.load offset=48
          local.get 2
          i32.const 12
          i32.or
          i32.add
          i32.const 0
          i32.store offset=16
          local.get 1
          i32.const 4
          i32.add
          local.set 1
          local.get 5
          i32.const 4
          i32.add
          local.tee 5
          local.get 8
          i32.ne
          br_if 0 (;@3;)
        end
      end
      local.get 6
      i32.eqz
      br_if 0 (;@1;)
      loop  ;; label = @2
        local.get 0
        i32.load offset=48
        local.get 1
        i32.const 2
        i32.shl
        i32.add
        i32.const 0
        i32.store offset=16
        local.get 1
        i32.const 1
        i32.add
        local.set 1
        local.get 4
        i32.const 1
        i32.add
        local.tee 4
        local.get 6
        i32.ne
        br_if 0 (;@2;)
      end
    end
    i32.const 3360788
    i32.load
    local.tee 1
    i32.load offset=116
    i32.eqz
    if  ;; label = @1
      local.get 1
      call 60460
    end
    local.get 7
    i32.const 0
    i32.const 0
    call 48872
    i32.eqz
    if  ;; label = @1
      local.get 7
      local.get 1
      call 44282
    end
    local.get 3
    i32.const 48
    i32.add
    global.set 0)
